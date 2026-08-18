import json
from pathlib import Path
from ml.disambiguator import disambiguate

DATA_PATH = Path(__file__).parent / "mock_candidates.json"


def run():
    with open(DATA_PATH) as f:
        cases = json.load(f)

    for name, case in cases.items():
        result = disambiguate(
            entity_text="",  # not used internally yet, kept for signature match
            sentence_context=case["sentence"],
            candidates=case["candidates"],
        )
        print(f"\n--- {name} ---")
        print("Sentence :", case["sentence"])
        print("Resolved :", result["resolved"])
        print("Alternates:", result["alternates"])
        if "flag" in result:
            print("Flag:", result["flag"])


if __name__ == "__main__":
    run()