# ARCHITECTURE.md — DocuMind

## 1. Conceptual Grounding

This system implements the architecture from Lewis et al. (2020), *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, adapted from a research prototype (dense retriever + BART generator, trained end-to-end) into a production-style application (off-the-shelf embeddings + retriever + instruction-tuned LLM, composed rather than jointly trained).

Mapping paper concepts → system components:

| Paper concept | This system |
|---|---|
| Query Encoder `q(x)` | Embedding model applied to the user's question |
| Document Index (non-parametric memory) | Vector database of chunk embeddings |
| Retriever `p_η(z\|x)` (DPR, MIPS top-K) | Vector similarity search (+ optional BM25 hybrid) returning top-K chunks |
| Generator `p_θ(y\|x,z)` (BART) | Instruction-tuned LLM (GPT-4o-mini / Claude / open-weight) prompted with retrieved chunks |
| RAG-Sequence vs RAG-Token | We implement the RAG-Sequence equivalent: one fixed retrieved set conditions the entire generated answer — simpler to build and matches the paper's finding that it performs comparably or better on most tasks |
| Index hot-swapping (Section 4.5 of the paper) | Re-ingestion pipeline that rebuilds/updates the vector index without redeploying the app |

## 2. High-Level Architecture

```
                         ┌─────────────────────────┐
                         │        Frontend          │
                         │  React + Tailwind (chat)  │
                         └────────────┬─────────────┘
                                      │ HTTPS / SSE (streaming)
                         ┌────────────▼─────────────┐
                         │        API Gateway        │
                         │   FastAPI (auth, rate     │
                         │   limiting, routing)      │
                         └───┬───────────────────┬───┘
                             │                   │
                 ┌───────────▼──────────┐ ┌──────▼────────────┐
                 │   Ingestion Service    │ │   Query Service     │
                 │  - parse (PDF/MD/TXT)  │ │  - embed query      │
                 │  - chunk               │ │  - retrieve (hybrid)│
                 │  - embed               │ │  - build prompt     │
                 │  - upsert to vector DB │ │  - call LLM         │
                 └───────────┬───────────┘ └──────┬────────────┘
                             │                     │
                 ┌───────────▼─────────────────────▼───────────┐
                 │              Vector Store                    │
                 │     pgvector (Postgres) or Qdrant/Weaviate    │
                 │   chunk_text, embedding, source, page, score  │
                 └────────────────────────┬───────────────────┘
                                          │
                         ┌────────────────▼────────────────┐
                         │        Metadata DB (Postgres)     │
                         │  documents, users, query_logs,    │
                         │  feedback, eval_results            │
                         └────────────────────────────────────┘

                 ┌──────────────────────────────────────────┐
                 │         Observability / Eval Layer         │
                 │  - structured logging (per-query trace)    │
                 │  - latency + token usage metrics            │
                 │  - retrieval precision/recall eval harness  │
                 └──────────────────────────────────────────┘
```

## 3. Component Details

### 3.1 Ingestion Service
- **Input:** raw files (PDF/MD/TXT).
- **Parsing:** `pypdf`/`unstructured` for PDFs; plain read for MD/TXT.
- **Chunking strategy:** recursive character/token-based splitter, ~300–500 tokens per chunk with ~15% overlap (overlap prevents losing context at chunk boundaries — a known failure mode when a fact straddles two chunks).
- **Embedding:** batch-embed chunks (OpenAI `text-embedding-3-small` or local `bge-small-en` via `sentence-transformers`).
- **Storage:** upsert `(chunk_id, text, embedding, source_doc_id, page_number, chunk_index)` into the vector store; also store document-level metadata in Postgres.
- **Idempotency:** re-ingesting the same document replaces its old chunks (content hash check) rather than duplicating.

### 3.2 Query Service
1. Receive user question.
2. Embed the question with the same embedding model used for chunks (critical — mismatched embedding spaces silently break retrieval).
3. Run **dense retrieval**: top-K nearest chunks by cosine similarity.
4. Run **sparse retrieval** (BM25) over the same corpus in parallel.
5. **Fuse** results (e.g., Reciprocal Rank Fusion) to get a final top-K — this hybrid approach is a known improvement over dense-only retrieval, and the paper itself shows BM25 sometimes outperforms the dense retriever on entity-heavy tasks like fact verification, so combining both is a deliberate architectural choice, not just an add-on.
6. Build a prompt: system instructions + retrieved chunks (with source tags) + user question.
7. Call the generator LLM with streaming enabled.
8. Post-process: extract citation markers, map back to source chunk IDs, attach a "sources" payload to the streamed response.
9. If max retrieval score < threshold, short-circuit with "insufficient information" instead of calling the LLM (saves cost and avoids hallucination).

### 3.3 Vector Store choice
- **Default:** `pgvector` extension on Postgres — one database for both metadata and vectors, simplest ops story, good enough for tens of thousands of chunks, and lets you show SQL + vector search skills in one place.
- **Alternative (if you want a dedicated-vector-DB line on your resume):** Qdrant or Weaviate — better ANN performance at scale, worth mentioning as a documented tradeoff in the README even if you ship with pgvector.

### 3.4 Generator LLM
- Abstracted behind an interface (`generate(prompt, stream=True)`) so you can swap providers (OpenAI/Anthropic/local vLLM) without touching the rest of the system — demonstrates clean interface design.
- Prompt template enforces: "Answer only using the provided context. Cite sources as [1], [2]. If the answer isn't in the context, say so."

### 3.5 Frontend
- React chat interface, streamed tokens via Server-Sent Events or `fetch` + `ReadableStream`.
- Each answer renders with a collapsible "Sources" panel showing retrieved chunks, their scores, and originating document/page.
- Feedback buttons (👍/👎) write to `/feedback`, stored for later eval-set curation.

### 3.6 Observability / Eval Layer
- Every query logged as a structured event: `{query, retrieved_chunk_ids, scores, answer, latency_ms, token_usage, timestamp}`.
- A small curated eval set (`eval/qa_pairs.json`, 20–30 hand-written question → expected-source-doc pairs) run via a script that reports:
  - Retrieval precision@K / recall@K
  - Faithfulness (does the answer's claims appear in the retrieved chunks — can start with a simple LLM-as-judge check)
- Metrics surfaced on a `/metrics` endpoint (Prometheus-style) or a simple admin dashboard page.

## 4. Data Flow Summary (single query)

```
User question
   → embed(question)
   → [dense search top-K] + [BM25 search top-K]
   → fuse → final top-K chunks
   → prompt = template(chunks, question)
   → LLM.generate(prompt, stream=True)
   → stream tokens to frontend
   → log query trace to Postgres
   → attach source citations to final response
```

## 5. Key Design Decisions & Tradeoffs (worth a README section — interviewers ask about these)

| Decision | Alternative considered | Why this choice |
|---|---|---|
| RAG-Sequence-style (single retrieval set per answer) | RAG-Token (per-token document mixing, as in the paper) | Per-token mixing requires custom model training/marginalization; not practical when composing off-the-shelf APIs. Sequence-style is simpler and the paper shows it's competitive. |
| Hybrid (dense + BM25) retrieval | Dense-only | Paper's own ablations show BM25 beats the dense retriever on FEVER (entity-centric); hybrid retrieval is more robust across query types. |
| pgvector over a dedicated vector DB | Qdrant/Weaviate/Pinecone | Fewer moving parts for a resume-scale project; still demonstrates vector search competency; documented as an explicit scaling tradeoff. |
| Abstracted LLM provider interface | Hardcoding one provider's SDK | Shows clean architecture; lets you swap in a self-hosted open-weight model later (e.g., via vLLM) without a rewrite. |
| "Say I don't know" threshold | Always generate an answer | Directly addresses the paper's stated motivation — reducing hallucination — and is an easy, concrete talking point in interviews. |

## 6. Deployment Architecture

- **Containers:** separate Dockerfiles for `api` (FastAPI) and `frontend` (React build served via Nginx or Vercel).
- **docker-compose.yml** for local dev: `api`, `postgres` (with pgvector), `frontend`.
- **CI (GitHub Actions):** on push — lint, run unit tests, run a small retrieval-eval smoke test, build Docker images.
- **Deployment target:** Render/Railway for the API + Postgres; Vercel/Netlify for the frontend, or a single combined deploy on Fly.io.
- **Secrets:** LLM API keys via environment variables / platform secret manager — never committed.

## 7. Testing Strategy

- **Unit tests:** chunking logic, embedding batching, prompt construction, citation-extraction from LLM output.
- **Integration tests:** ingest a fixture document → query it → assert expected chunk is retrieved.
- **Eval tests (non-blocking, scheduled):** run the labeled `eval/qa_pairs.json` set and report precision/recall/faithfulness as a CI artifact (not a hard pass/fail gate, since LLM output varies).

## 8. Future Extensions (stretch goals, good "what I'd do next" talking points)

- Swap dense retriever encoder for a fine-tuned domain-specific embedding model.
- Add re-ranking stage (cross-encoder) after initial retrieval for higher precision.
- Multi-hop retrieval for questions requiring evidence from multiple documents.
- Self-host the generator via vLLM (ties into the PagedAttention paper) to remove per-token API cost and demonstrate systems/infra skills.
