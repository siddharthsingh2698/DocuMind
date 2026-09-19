# DocuMind Research Corpus: Dense Retrieval & RAG Literature

## Overview

DocuMind is built around a curated corpus of seminal and modern research papers in NLP, Dense Retrieval, and Retrieval-Augmented Generation. This domain-specific corpus provides a realistic, knowledge-intensive testbed for evaluation, question answering, and citation provenance.

## Anchor Paper

- **Paper:** *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*
- **Authors:** Patrick Lewis, Ethan Perez, Aleksandur Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela
- **Venue:** NeurIPS 2020
- **arXiv ID:** [2005.11401](https://arxiv.org/abs/2005.11401)
- **Local File:** `corpus/lewis_et_al_2020_rag.pdf`

## Target Paper Set (15 Landmark Papers)

The following papers represent the foundational lineage and state of the art in RAG systems:

| # | Title | Authors | Year | arXiv ID / Link |
|---|---|---|---|---|
| 1 | Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks | Lewis et al. | 2020 | [2005.11401](https://arxiv.org/abs/2005.11401) |
| 2 | Dense Passage Retrieval for Open-Domain Question Answering (DPR) | Karpukhin et al. | 2020 | [2004.04906](https://arxiv.org/abs/2004.04906) |
| 3 | REALM: Retrieval-Augmented Language Model Pre-Training | Guu et al. | 2020 | [2002.08909](https://arxiv.org/abs/2002.08909) |
| 4 | Attention Is All You Need | Vaswani et al. | 2017 | [1706.03762](https://arxiv.org/abs/1706.03762) |
| 5 | ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction | Khattab & Zaharia | 2020 | [2004.12832](https://arxiv.org/abs/2004.12832) |
| 6 | Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE) | Gao et al. | 2022 | [2212.10496](https://arxiv.org/abs/2212.10496) |
| 7 | Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection | Asai et al. | 2023 | [2310.11511](https://arxiv.org/abs/2310.11511) |
| 8 | FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness | Dao et al. | 2022 | [2205.14135](https://arxiv.org/abs/2205.14135) |
| 9 | Efficient Memory Management for Large Language Model Serving with PagedAttention (vLLM) | Kwon et al. | 2023 | [2309.06180](https://arxiv.org/abs/2309.06180) |
| 10 | Lost in the Middle: How Language Models Use Long Contexts | Liu et al. | 2023 | [2307.03172](https://arxiv.org/abs/2307.03172) |
| 11 | In-Context Retrieval-Augmented Language Models (Iter-RetGEN) | Shao et al. | 2023 | [2305.15294](https://arxiv.org/abs/2305.15294) |
| 12 | Active Retrieval Augmented Generation (FLARE) | Jiang et al. | 2023 | [2305.06983](https://arxiv.org/abs/2305.06983) |
| 13 | RAG-Survey: Retrieval-Augmented Generation for Large Language Models: A Survey | Gao et al. | 2023 | [2312.10997](https://arxiv.org/abs/2312.10997) |
| 14 | REPLUG: Retrieval-Augmented Black-Box Language Models | Shi et al. | 2023 | [2301.12652](https://arxiv.org/abs/2301.12652) |
| 15 | Benchmarking Large Language Models in Retrieval-Augmented Generation (CRUD-RAG) | Lyu et al. | 2024 | [2401.17043](https://arxiv.org/abs/2401.17043) |

## Downloading Papers

To automatically fetch the PDFs into this directory, run:

```bash
python corpus/download_papers.py
```
