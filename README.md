# DocuMind: RAG-Based Document Q&A System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![pgvector](https://img.shields.io/badge/Postgres-pgvector-336791.svg?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)

> **DocuMind** is a production-quality Retrieval-Augmented Generation (RAG) system that enables users to ask natural-language questions over a private corpus of documents and receive grounded, cited, and verifiably retrieved answers.

---

## 1. Grounding & Theoretical Motivation

DocuMind is directly grounded in the landmark research paper:
> **Lewis et al. (2020)**, *"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"*, NeurIPS 2020 ([arXiv:2005.11401](https://arxiv.org/abs/2005.11401)).

### Paper Concepts to Production System Mapping

| Paper Concept | DocuMind Production Component | Architectural Rationale |
|---|---|---|
| **Query Encoder $q(x)$** | Embedding Model (`text-embedding-3-small` / `bge-small-en`) | Embeds the user question into the shared dense vector space |
| **Document Index (Non-parametric Memory)** | Vector Database (`pgvector` on PostgreSQL) | Hot-swappable document index storing chunk embeddings with metadata |
| **Retriever $p_\eta(z\|x)$** | Hybrid Retriever: Cosine Similarity + BM25 (Rank Fusion) | Dense captures semantic similarity; sparse BM25 guarantees entity/keyword recall |
| **Generator $p_\theta(y\|x, z)$** | Instruction-tuned LLM (`gpt-4o-mini` / Claude Haiku) | Generates grounded responses conditioned strictly on retrieved evidence |
| **RAG-Sequence Model** | Whole-sequence Context Prompting | One fixed retrieval set conditions the entire answer generation |
| **Index Hot-Swapping (§4.5)** | Idempotent Ingestion Pipeline | Updates or swaps indices without redeploying or incurring downtime |

---

## 2. High-Level Architecture

```
                             ┌─────────────────────────┐
                             │    Frontend (React)     │
                             │  Vite + Tailwind + SSE  │
                             └────────────┬────────────┘
                                          │ HTTPS / SSE Stream
                             ┌────────────▼────────────┐
                             │       FastAPI API       │
                             │  Routing, Auth, Logger  │
                             └───┬─────────────────┬───┘
                                 │                 │
                     ┌───────────▼────────┐ ┌──────▼────────────┐
                     │ Ingestion Pipeline │ │   Query Pipeline  │
                     │  - Parse (PDF/MD)  │ │  - Embed Query    │
                     │  - Chunk & Overlap │ │  - Hybrid Search  │
                     │  - Batch Embed     │ │  - RRF Fusion     │
                     │  - Upsert Vectors  │ │  - Stream Answer  │
                     └───────────┬────────┘ └──────┬────────────┘
                                 │                 │
                     ┌───────────▼─────────────────▼────────────┐
                     │          PostgreSQL + pgvector           │
                     │   Vector storage (chunks, embeddings)    │
                     │   + Relational metadata (logs, feedback) │
                     └──────────────────────────────────────────┘
```

---

## 3. The Document Corpus

Rather than a generic "chat-with-a-random-PDF" demo, DocuMind is built around a domain-specific, curated research corpus:
**Landmark Research Papers on Dense Retrieval and Retrieval-Augmented Generation (15–20 papers)**.

- **Primary Anchor**: Lewis et al. (2020), *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (stored in `corpus/lewis_et_al_2020_rag.pdf`).
- Additional foundational works: Karpukhin et al. (DPR), Guu et al. (REALM), Khattab & Zaharia (ColBERT), Vaswani et al. (Transformer), and modern self-reflective RAG architectures.
- The corpus can be easily downloaded and populated via `python corpus/download_papers.py`.

---

## 4. Repository Structure

```
DocuMind/
├── api/                    # FastAPI backend service
│   ├── src/                # Application source code
│   │   ├── config.py       # Pydantic configuration and environment settings
│   │   └── main.py         # FastAPI application entrypoint & health check
│   ├── tests/              # Backend test suite (pytest)
│   ├── Dockerfile          # Backend container image definition
│   └── pyproject.toml      # Python dependencies and build metadata
├── frontend/               # React + Tailwind CSS web interface
│   ├── src/                # UI components and client logic
│   ├── Dockerfile          # Frontend container image definition
│   └── package.json        # Frontend dependencies and Vite configuration
├── eval/                   # Evaluation harness and benchmarks
│   ├── qa_pairs.example.json  # Hand-curated question-provenance test set
│   └── eval_stub.py        # Evaluation runner and metrics calculator
├── corpus/                 # Document repository for indexing
│   ├── README.md           # Corpus catalog and documentation
│   ├── download_papers.py  # Automated arXiv paper fetcher
│   └── lewis_et_al_2020_rag.pdf
├── docker-compose.yml      # Local orchestration (PostgreSQL+pgvector, API, UI)
├── .env.example            # Environment variables template
├── ARCHITECTURE.md         # Detailed architectural design and tradeoffs
├── PRD.md                  # Product Requirements Document
└── PLAN.md                 # Week-by-week implementation roadmap
```

---

## 5. Quickstart & Setup

### Prerequisites
- **Python**: 3.12+ (or managed via [`uv`](https://github.com/astral-sh/uv))
- **Node.js**: 20+ (with `npm`)
- **Docker & Docker Compose** (for containerized PostgreSQL with pgvector)

### 1. Clone & Configure Environment

```bash
git clone <repo-url> documind
cd documind
cp .env.example .env
# Edit .env and supply your OPENAI_API_KEY
```

### 2. Run Backend with `uv`

```bash
cd api
uv venv
# On Windows: .venv\Scripts\activate
# On Linux/macOS: source .venv/bin/activate
uv pip install -e ".[dev]"

# Run tests
pytest

# Start the API server
uvicorn src.main:app --reload --port 8000
```
Visit `http://localhost:8000/health` to confirm the backend is running.

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Running with Docker Compose

```bash
docker compose up --build
```
This boots:
- PostgreSQL with `pgvector` on port `5432`
- FastAPI backend on port `8000`
- React frontend on port `5173`

---

## 6. Development Roadmap

- [x] **Week 0: Setup & Corpus Selection** (Repository scaffolding, research corpus catalog, FastAPI & React skeletons, CI & Docker configuration)
- [ ] **Week 1: Ingestion Pipeline** (PDF/MD parsers, chunking strategy, pgvector storage, content-hash dedup CLI)
- [ ] **Week 2: Hybrid Retrieval & Generation Core** (Dense similarity + BM25 reciprocal rank fusion, prompt engineering, citation mapping, eval harness)
- [ ] **Week 3: REST API Layer** (FastAPI streaming SSE `/query`, `/ingest`, rate limiting, structured logging)
- [ ] **Week 4: Frontend Chat Interface** (React, source citation panel, responsive styling)
- [ ] **Week 5: Observability, CI/CD & Deployment** (Metrics, GitHub Actions, cloud deployment)
- [ ] **Week 6: Polish & Resume Readiness** (Benchmarking report, architecture documentation, demo recording)

---

## 7. License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
#   D o c u M i n d  
 