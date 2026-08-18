"""
build_gazetteer.py
Owner: Person 1 (Data & Database)

Downloads GeoNames India data + admin code lookup tables, cleans and joins
them, and loads the result into a SQLite database at backend/data/gazetteer.db

Usage:
    python backend/etl/build_gazetteer.py

Safe to re-run: it wipes and rebuilds the `places` table each time, and
skips re-downloading files that already exist on disk.
"""

import io
import sqlite3
import zipfile
from pathlib import Path

import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
THIS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = THIS_DIR.parent
RAW_DIR = BACKEND_DIR / "data" / "raw"
DB_PATH = BACKEND_DIR / "data" / "gazetteer.db"

RAW_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Source URLs (GeoNames.org exports)
# ---------------------------------------------------------------------------
IN_ZIP_URL = "https://download.geonames.org/export/dump/IN.zip"
ADMIN1_URL = "https://download.geonames.org/export/dump/admin1CodesASCII.txt"
ADMIN2_URL = "https://download.geonames.org/export/dump/admin2Codes.txt"

IN_TXT_PATH = RAW_DIR / "IN.txt"
ADMIN1_PATH = RAW_DIR / "admin1CodesASCII.txt"
ADMIN2_PATH = RAW_DIR / "admin2Codes.txt"

# Feature codes worth keeping (populated places + administrative divisions).
# Full list: https://www.geonames.org/export/codes.html
KEEP_FEATURE_CODES = {
    "PPL", "PPLA", "PPLA2", "PPLA3", "PPLA4", "PPLC", "PPLF", "PPLG",
    "PPLL", "PPLR", "PPLS", "PPLW", "PPLX",  # populated places (villages -> capital)
    "ADM1", "ADM2", "ADM3", "ADM4",           # administrative divisions
}

GEONAMES_COLUMNS = [
    "geonameid", "name", "asciiname", "alternatenames", "latitude", "longitude",
    "feature_class", "feature_code", "country_code", "cc2",
    "admin1_code", "admin2_code", "admin3_code", "admin4_code",
    "population", "elevation", "dem", "timezone", "modification_date",
]


def _download(url: str, dest: Path) -> None:
    if dest.exists():
        print(f"  [skip] {dest.name} already downloaded")
        return
    print(f"  [get ] {url}")
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    dest.write_bytes(resp.content)


def download_raw_files() -> None:
    print("Downloading GeoNames source files...")
    zip_path = RAW_DIR / "IN.zip"
    _download(IN_ZIP_URL, zip_path)
    if not IN_TXT_PATH.exists():
        with zipfile.ZipFile(zip_path) as zf:
            with zf.open("IN.txt") as src, open(IN_TXT_PATH, "wb") as out:
                out.write(src.read())
    _download(ADMIN1_URL, ADMIN1_PATH)
    _download(ADMIN2_URL, ADMIN2_PATH)


def load_places_raw() -> pd.DataFrame:
    df = pd.read_csv(
        IN_TXT_PATH,
        sep="\t",
        header=None,
        names=GEONAMES_COLUMNS,
        dtype={"admin1_code": str, "admin2_code": str},
        keep_default_na=False,
        na_values=[""],
        quoting=3,  # csv.QUOTE_NONE -- GeoNames data has stray quote chars
    )
    return df


def load_admin_codes(path: Path) -> pd.DataFrame:
    df = pd.read_csv(
        path,
        sep="\t",
        header=None,
        names=["code", "name", "asciiname", "geonameid"],
        dtype=str,
        keep_default_na=False,
    )
    return df


def build_dataframe() -> pd.DataFrame:
    print("Parsing raw place records...")
    places = load_places_raw()

    before = len(places)
    places = places[places["feature_code"].isin(KEEP_FEATURE_CODES)].copy()
    print(f"  kept {len(places)}/{before} rows after feature-code filter")

    print("Joining admin1 (state) and admin2 (district) names...")
    admin1 = load_admin_codes(ADMIN1_PATH)
    admin2 = load_admin_codes(ADMIN2_PATH)

    # Build lookup keys: GeoNames admin codes are "CC.admin1" and "CC.admin1.admin2"
    places["admin1_full_code"] = "IN." + places["admin1_code"].fillna("")
    places["admin2_full_code"] = (
        "IN." + places["admin1_code"].fillna("") + "." + places["admin2_code"].fillna("")
    )

    admin1_map = dict(zip(admin1["code"], admin1["asciiname"]))
    admin2_map = dict(zip(admin2["code"], admin2["asciiname"]))

    places["state"] = places["admin1_full_code"].map(admin1_map).fillna("")
    places["district"] = places["admin2_full_code"].map(admin2_map).fillna("")

    out = places[[
        "geonameid", "name", "asciiname", "state", "district",
        "latitude", "longitude", "population", "feature_code",
    ]].copy()

    out["name_lower"] = out["name"].str.lower().str.strip()
    out["asciiname_lower"] = out["asciiname"].str.lower().str.strip()

    return out


def write_sqlite(df: pd.DataFrame) -> None:
    print(f"Writing {len(df)} rows to {DB_PATH} ...")
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        df.to_sql("places", conn, if_exists="replace", index=False)
        cur = conn.cursor()
        cur.execute("CREATE INDEX IF NOT EXISTS idx_places_name ON places(name_lower)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_places_asciiname ON places(asciiname_lower)")
        conn.commit()
    finally:
        conn.close()
    print("Done.")


def main() -> None:
    download_raw_files()
    df = build_dataframe()
    write_sqlite(df)
    print(f"\nGazetteer ready: {DB_PATH}  ({df.shape[0]} rows)")


if __name__ == "__main__":
    main()