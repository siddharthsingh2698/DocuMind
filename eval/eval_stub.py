"""
Evaluation harness validation stub for DocuMind.
Validates the evaluation dataset schema and ensures readiness for Week 2 retrieval benchmarking.
"""

import json
import os
import sys

EVAL_DIR = os.path.dirname(os.path.abspath(__file__))
QA_FILE = os.path.join(EVAL_DIR, "qa_pairs.example.json")


def validate_qa_dataset(filepath: str) -> bool:
    if not os.path.exists(filepath):
        print(f"[ERROR] Evaluation file not found: {filepath}", file=sys.stderr)
        return False

    with open(filepath, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as err:
            print(f"[ERROR] Invalid JSON in {filepath}: {err}", file=sys.stderr)
            return False

    if not isinstance(data, list):
        print("[ERROR] Root JSON must be an array of question items.", file=sys.stderr)
        return False

    print(f"Loaded {len(data)} evaluation questions from {os.path.basename(filepath)}.")
    valid_count = 0
    required_keys = {"id", "question", "expected_answer", "gold_sources"}

    for idx, item in enumerate(data):
        missing = required_keys - set(item.keys())
        if missing:
            print(f"[WARN] Item #{idx} ({item.get('id', 'unknown')}) missing keys: {missing}")
            continue

        if not isinstance(item["gold_sources"], list) or len(item["gold_sources"]) == 0:
            print(f"[WARN] Item {item['id']} must specify at least one gold source.")
            continue

        valid_count += 1
        print(f"  [OK] {item['id']}: \"{item['question'][:60]}...\" -> {len(item['gold_sources'])} gold sources")

    print(f"\nEvaluation dataset validation: {valid_count}/{len(data)} items valid.")
    return valid_count == len(data)


if __name__ == "__main__":
    success = validate_qa_dataset(QA_FILE)
    sys.exit(0 if success else 1)
