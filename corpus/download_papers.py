"""
Utility script to fetch landmark RAG & Dense Retrieval papers from arXiv into the corpus directory.
"""

import argparse
import os
import sys
import time
import urllib.request

PAPERS = [
    {
        "id": "2005.11401",
        "filename": "lewis_et_al_2020_rag.pdf",
        "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    },
    {
        "id": "2004.04906",
        "filename": "karpukhin_et_al_2020_dpr.pdf",
        "title": "Dense Passage Retrieval for Open-Domain Question Answering",
    },
    {
        "id": "2002.08909",
        "filename": "guu_et_al_2020_realm.pdf",
        "title": "REALM: Retrieval-Augmented Language Model Pre-Training",
    },
    {
        "id": "1706.03762",
        "filename": "vaswani_et_al_2017_transformer.pdf",
        "title": "Attention Is All You Need",
    },
    {
        "id": "2004.12832",
        "filename": "khattab_zaharia_2020_colbert.pdf",
        "title": "ColBERT: Contextualized Late Interaction over BERT",
    },
    {
        "id": "2212.10496",
        "filename": "gao_et_al_2022_hyde.pdf",
        "title": "Precise Zero-Shot Dense Retrieval without Relevance Labels",
    },
    {
        "id": "2310.11511",
        "filename": "asai_et_al_2023_self_rag.pdf",
        "title": "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection",
    },
    {
        "id": "2307.03172",
        "filename": "liu_et_al_2023_lost_in_the_middle.pdf",
        "title": "Lost in the Middle: How Language Models Use Long Contexts",
    },
]

CORPUS_DIR = os.path.dirname(os.path.abspath(__file__))


def download_paper(paper: dict, force: bool = False) -> bool:
    dest_path = os.path.join(CORPUS_DIR, paper["filename"])
    if os.path.exists(dest_path) and not force:
        print(f"[EXISTS] {paper['filename']} ({paper['title']})")
        return True

    url = f"https://arxiv.org/pdf/{paper['id']}.pdf"
    print(f"[DOWNLOADING] {paper['title']} from {url}...")
    headers = {
        "User-Agent": "DocuMind-CorpusDownloader/1.0 (academic research corpus; contact: admin@documind.local)"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response, open(dest_path, "wb") as out_file:
            out_file.write(response.read())
        print(f"[SAVED] {paper['filename']}")
        # Polite delay between arXiv requests
        time.sleep(2)
        return True
    except Exception as exc:
        print(f"[ERROR] Failed to download {paper['id']}: {exc}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Download research papers for DocuMind corpus")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of papers to download")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    papers_to_download = PAPERS[: args.limit] if args.limit else PAPERS
    success_count = 0

    print(f"Target corpus directory: {CORPUS_DIR}")
    for paper in papers_to_download:
        if download_paper(paper, force=args.force):
            success_count += 1

    print(f"\nCorpus preparation finished: {success_count}/{len(papers_to_download)} papers ready.")


if __name__ == "__main__":
    main()
