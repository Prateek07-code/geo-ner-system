import json
from ml.pipeline import analyze_sentence

def run_evaluation():
    try:
        with open("data/test_sentences.json", encoding="utf-8") as f:
            test_set = json.load(f)
    except FileNotFoundError:
        print("ERROR: data/test_sentences.json not found. Make sure you are running this from the backend directory.")
        return

    total_expected = 0
    total_detected = 0
    resolved_count = 0
    no_match_count = 0
    exceptions = 0
    
    # NEW: List to track exactly what got resolved
    resolved_details = []

    print(f"Running pipeline on {len(test_set)} sentences...\n")

    for case in test_set:
        try:
            output = analyze_sentence(case["sentence"])
            expected_entities = case.get("expected_entities", [])
            total_expected += len(expected_entities)
            
            detected_texts = [ent["text"].lower() for ent in output.get("entities", [])]
            
            for expected in expected_entities:
                if any(expected.lower() in d or d in expected.lower() for d in detected_texts):
                    total_detected += 1

            for ent in output.get("entities", []):
                if ent.get("status") == "resolved":
                    resolved_count += 1
                    # NEW: Save the details for the log pass
                    resolved_details.append({
                        "sentence": case["sentence"],
                        "entity": ent["text"],
                        "resolved_to": f"{ent['resolved']['district']}, {ent['resolved']['state']}",
                        "confidence": ent['resolved']['confidence']
                    })
                elif ent.get("status") == "no_confident_match":
                    no_match_count += 1

        except Exception as e:
            exceptions += 1

    print("--- ACCURACY & TESTING LOG (RAW NUMBERS) ---")
    print(f"Total Sentences Tested: {len(test_set)}")
    print(f"Sentences that crashed (Exceptions): {exceptions}")
    print(f"Total Expected Entities (Ground Truth): {total_expected}")
    
    recall = (total_detected / total_expected * 100) if total_expected > 0 else 0
    print(f"Detection Recall: {total_detected}/{total_expected} ({recall:.2f}%)")
    
    print(f"Entities Resolved (Matched in DB): {resolved_count}")
    print(f"Entities Unresolved (no_confident_match): {no_match_count}")
    
    # NEW: Print the resolution breakdown
    print("\n--- RESOLVED ENTITIES LOG PASS ---")
    for i, detail in enumerate(resolved_details, 1):
        print(f"{i}. Sentence: '{detail['sentence']}'")
        print(f"   Entity: {detail['entity']}")
        print(f"   Resolved To: {detail['resolved_to']} (Confidence: {detail['confidence']})")
        print(f"   Correct against ground truth?: [WAITING FOR MANUAL VERIFICATION]\n")
    print("--------------------------------------------")

if __name__ == "__main__":
    run_evaluation()