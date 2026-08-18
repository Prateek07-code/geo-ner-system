"""
Sanity checker for nlp-ml/data/test_sentences.json
Run this any time the file is edited, to catch typos/schema errors early.

Checks:
1. Valid JSON
2. Required keys present on every entry (id, category, sentence, expected_entities)
3. IDs are unique and sequential
4. Every string in expected_entities actually appears in `sentence` (case-insensitive)
5. no_place entries have an empty expected_entities list
6. Reports category counts and total
"""

import json
import sys

PATH = "nlp-ml/data/test_sentences.json"
REQUIRED_KEYS = {"id", "category", "sentence", "expected_entities"}

def main():
    with open(PATH, encoding="utf-8") as f:
        data = json.load(f)

    errors = []
    seen_ids = set()
    category_counts = {}

    for i, entry in enumerate(data):
        missing = REQUIRED_KEYS - entry.keys()
        if missing:
            errors.append(f"Entry #{i}: missing keys {missing}")
            continue

        eid = entry["id"]
        if eid in seen_ids:
            errors.append(f"id {eid}: duplicate id")
        seen_ids.add(eid)

        sentence_lower = entry["sentence"].lower()
        for ent in entry["expected_entities"]:
            if ent.lower() not in sentence_lower:
                errors.append(
                    f"id {eid}: expected entity '{ent}' not found as a substring "
                    f"of sentence: {entry['sentence']!r}"
                )

        if entry["category"] == "no_place" and entry["expected_entities"]:
            errors.append(f"id {eid}: category is 'no_place' but expected_entities is non-empty")

        category_counts[entry["category"]] = category_counts.get(entry["category"], 0) + 1

    # sequential id check
    expected_ids = set(range(1, len(data) + 1))
    if seen_ids != expected_ids:
        errors.append(f"ids are not a clean 1..N sequence. Missing: {sorted(expected_ids - seen_ids)}, Extra: {sorted(seen_ids - expected_ids)}")

    print(f"Total sentences: {len(data)}")
    print("Category breakdown:")
    for cat, count in sorted(category_counts.items()):
        print(f"  {cat}: {count}")

    if errors:
        print(f"\n{len(errors)} ERROR(S) FOUND:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("\nAll checks passed — dataset is clean.")

if __name__ == "__main__":
    main()