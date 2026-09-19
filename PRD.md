# PRD.md — DocuMind: RAG-Based Document Q&A System

## 1. Overview

**Project name:** DocuMind
**Owner:** Siddharth
**Type:** Personal resume project (production-quality, not a tutorial clone)
**Grounding:** Lewis et al., *"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"*, NeurIPS 2020 ([arXiv:2005.11401](https://arxiv.org/abs/2005.11401))

**One-line pitch:** A system that lets a user ask natural-language questions over a private corpus of documents and get answers that are grounded, cited, and verifiably retrieved — not hallucinated.

## 2. Problem Statement

Large language models store facts in their parameters but:
- Can't be updated with new knowledge without retraining
- Can't show *where* an answer came from (no provenance)
- Hallucinate confidently when they don't know something

The RAG paper's core idea: split "knowing" into two parts — a **non-parametric memory** (a searchable document index) and a **parametric generator** (an LLM) — and let the model condition its output on retrieved evidence instead of memorized facts alone.

DocuMind productionizes this idea for a real, specific corpus (e.g., a company's internal engineering docs, a set of research papers, or product documentation) instead of "chat with a random PDF."

## 3. Goals

| Goal | Success Metric |
|---|---|
| Accurate, grounded answers | ≥85% of answers cite the correct source document (manual eval on a 30-question test set) |
| Low hallucination rate | <10% of answers contain unsupported claims (faithfulness eval) |
| Fast retrieval | p95 retrieval latency < 300ms on a 10k-chunk corpus |
| Real deployment | Publicly accessible URL, not just localhost |
| Demonstrable engineering depth | CI pipeline, tests, logging/observability, documented tradeoffs |

## 4. Non-Goals

- Not building a general-purpose chatbot (out of scope: small talk, non-corpus questions)
- Not training or fine-tuning an LLM from scratch (use existing LLM APIs or open-weight models)
- Not building multi-tenant SaaS auth/billing (single-user or demo-auth is enough)
- Not optimizing for massive scale (millions of docs) — target 1k–50k chunks, enough to prove the architecture

## 5. Users & Use Cases

**Primary user:** A hiring manager/interviewer evaluating this as a portfolio piece, and secondarily anyone who wants to query the chosen corpus.

**Use cases:**
1. User uploads or selects a document set (PDFs, markdown, docs).
2. User asks a question in natural language.
3. System retrieves the most relevant chunks, generates an answer grounded in them, and shows which chunks/sources were used.
4. User can inspect retrieval quality (which documents were pulled, their relevance scores).
5. (Stretch) User gives feedback (thumbs up/down) that gets logged for future eval.

## 6. Functional Requirements

### 6.1 Ingestion
- FR1: Accept PDF, TXT, and Markdown file uploads.
- FR2: Parse and chunk documents (configurable chunk size/overlap).
- FR3: Generate embeddings for each chunk and store them with metadata (source file, page number, chunk index).
- FR4: Support re-ingestion / index updates without full rebuild (index hot-swapping, as demonstrated in the paper's Wikipedia-2016-vs-2018 experiment).

### 6.2 Retrieval
- FR5: Given a query, embed it and retrieve top-K nearest chunks via vector similarity search.
- FR6: Support hybrid retrieval — combine dense (embedding) search with sparse (BM25/keyword) search.
- FR7: Return retrieval scores alongside chunks for transparency/debugging.

### 6.3 Generation
- FR8: Condition an LLM's answer on the retrieved chunks (RAG-Sequence style: same retrieved set used for the whole generated answer — simplest and matches the paper's stronger-performing variant on most tasks).
- FR9: Answer must include inline citations back to source chunks.
- FR10: If retrieval confidence is low, the system should say "I don't have enough information" rather than guess.

### 6.4 API & Frontend
- FR11: REST API exposing `/ingest`, `/query`, `/health`, `/feedback`.
- FR12: Chat-style frontend with streaming responses and a visible "sources" panel per answer.
- FR13: Basic auth (API key or JWT) to gate access.

### 6.5 Evaluation & Observability
- FR14: Log every query: retrieved doc IDs, scores, generated answer, latency, token usage.
- FR15: Maintain a small labeled eval set (question → expected source doc) to compute retrieval precision/recall on demand.
- FR16: Expose a `/metrics` endpoint or dashboard showing latency, retrieval hit-rate, and usage over time.

## 7. Non-Functional Requirements

- **Latency:** end-to-end query response (retrieval + generation) under 3s p95 for streaming-start.
- **Reliability:** graceful degradation if the LLM API is down (return retrieved chunks even without generation).
- **Security:** no secrets in source control; rate-limited public endpoints.
- **Portability:** fully dockerized; runs identically locally and in the cloud.
- **Cost-awareness:** log token usage per query; cap max tokens per request.

## 8. Tech Stack (proposed — see ARCHITECTURE.md for rationale)

- Backend: Python, FastAPI
- Vector store: pgvector (Postgres) or Weaviate/Qdrant
- Embeddings: OpenAI `text-embedding-3-small` or open-weight (e.g., `bge-small-en`) for a no-API-cost variant
- Generator LLM: OpenAI GPT-4o-mini / Claude Haiku / open-weight via vLLM (stretch)
- Frontend: React + Tailwind
- Infra: Docker, GitHub Actions CI, deployed on Render/Railway/Fly.io/AWS

## 9. Milestones (see PLAN.md for detailed week-by-week breakdown)

1. Ingestion pipeline + vector store working end-to-end (CLI only)
2. Retrieval API with hybrid search
3. Generation with citations
4. Frontend chat UI
5. Evaluation harness + metrics dashboard
6. Deployment + CI/CD
7. Polish: README, architecture diagram, demo video

## 10. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| LLM API cost during development | Use a small/free-tier model or local open-weight model for dev; cache responses |
| Retrieval quality hard to evaluate objectively | Build a small hand-labeled eval set early (20–30 Q&A pairs) |
| Corpus choice too generic (looks like a tutorial clone) | Pick a specific, real corpus (e.g., a real open-source project's docs, or a stack of ML papers) and say so explicitly in the README |
| Scope creep (trying to build multi-tenant SaaS) | Explicitly out of scope — see Non-Goals |

## 11. Definition of Done

- [ ] Publicly deployed, working demo link
- [ ] README with architecture diagram and setup instructions
- [ ] ≥70% test coverage on backend logic
- [ ] CI pipeline running tests on every push
- [ ] Eval report showing retrieval precision/recall and faithfulness numbers
- [ ] Documented in the PLAN.md and ARCHITECTURE.md files, kept in sync with actual implementation
