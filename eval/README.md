# Evaluation Harness for DocuMind

## Purpose & Metrics

A RAG system is only as good as its retrieval quality and generation faithfulness. To prevent regressions and evaluate changes objectively, DocuMind maintains a curated evaluation dataset.

### Core Metrics

1. **Retrieval Precision@K**:
   $$\text{Precision@K} = \frac{|\text{Retrieved Chunks in Top-}K \cap \text{Gold Relevant Chunks}|}{K}$$
   Measures the fraction of retrieved passages that are actually relevant.

2. **Retrieval Recall@K / Hit Rate@K**:
   $$\text{Hit Rate@K} = \mathbb{I}(\text{Gold Source Document is present in Top-}K)$$
   Target: $\ge 85\%$ hit rate on the curated eval set.

3. **Faithfulness / Groundedness**:
   Measures whether claims made in the generated answer are strictly supported by the retrieved passages, penalizing hallucinations.

## Data Schema (`qa_pairs.json`)

Each entry in `eval/qa_pairs.json` contains:
- `id`: Unique test case identifier.
- `question`: Natural language question.
- `expected_answer`: Reference gold answer.
- `gold_sources`: Expected document and section/page citations.
- `keywords`: Key domain terms expected in relevant chunks.

## Running Evaluation

```bash
python eval/eval_stub.py
```
In Week 2, this will be connected directly to the retrieval and generation pipeline.
