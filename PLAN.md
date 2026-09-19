# PLAN.md — Build Plan for DocuMind

Reference: PRD.md (what/why), ARCHITECTURE.md (how the system is structured). This file is the execution roadmap — what to build, in what order, and what "done" looks like at each step.

Total estimated time: **4–6 weeks** at ~10–15 hrs/week (part-time alongside classes/job search). Each week ends with something runnable — commit and push at every checkpoint so your GitHub history shows real incremental progress, not one giant initial commit.

---

## Week 0 — Setup & Corpus Selection (2–3 hrs)

- [x] Pick a **specific, real corpus** — not a random PDF. Good options:
  - Docs of a real open-source project (e.g., FastAPI docs, a library you use)
  - A stack of 15–20 ML/CS research papers (meta and on-theme, given this project)
  - Your college department's course materials / an internship's public docs
  *(Selected: Curated 15 landmark Dense Retrieval & RAG research papers, anchored by Lewis et al. 2020)*
- [x] Create GitHub repo `documind` with README stub, MIT license, `.gitignore`
- [x] Set up project skeleton:
  ```
  documind/
    api/
    frontend/
    eval/
    corpus/
    docker-compose.yml
    PLAN.md / PRD.md / ARCHITECTURE.md
  ```
- [x] Set up Python env (`uv` or `venv`), Node env for frontend
- [x] Sign up for LLM API (OpenAI/Anthropic) — set a hard spending cap
  *(Configured via `.env.example` with spending cap guidance in README)*
- **Checkpoint:** repo exists, README explains the goal, docs committed. [COMPLETED]

---

## Week 1 — Ingestion Pipeline (CLI only, no API yet)

- [ ] Write PDF/MD/TXT parsers (`pypdf` or `unstructured`)
- [ ] Implement chunking (recursive splitter, configurable size/overlap)
- [ ] Set up Postgres + pgvector locally via Docker
- [ ] Write embedding function (start with OpenAI `text-embedding-3-small`, or `bge-small-en` locally to avoid cost during dev)
- [ ] Write `ingest.py` CLI: `python ingest.py --path ./corpus/`
  - Parses → chunks → embeds → upserts into pgvector
  - Handles re-ingestion (content-hash dedup) — this is FR4 from the PRD
- [ ] Unit tests: chunking correctness, dedup logic
- **Checkpoint:** run `python ingest.py` on your corpus, verify rows in Postgres with `psql`.

---

## Week 2 — Retrieval + Generation Core (still CLI/script, no web API)

- [ ] Write `retrieve.py`: embed a query, run dense top-K search
- [ ] Add BM25 sparse search (e.g., `rank_bm25` library) over the same chunks
- [ ] Implement fusion (Reciprocal Rank Fusion) of dense + sparse results
- [ ] Write prompt template enforcing citation + "say I don't know" behavior
- [ ] Wire up LLM call (streaming) with retrieved chunks in context
- [ ] Manually test 10–15 questions against your corpus; note failure cases
- [ ] Build the first version of `eval/qa_pairs.json` (20–30 hand-labeled Q → expected source doc)
- [ ] Write `eval.py`: runs the eval set, reports precision@K/recall@K
- **Checkpoint:** a script that takes a question on the command line and prints a cited answer. Eval script runs and produces a number you can quote (e.g., "82% retrieval precision@5").

---

## Week 3 — API Layer

- [ ] Set up FastAPI project structure (`api/main.py`, routers, Pydantic schemas)
- [ ] Implement endpoints from the PRD: `/ingest`, `/query` (streaming via SSE), `/health`, `/feedback`
- [ ] Add API key / simple JWT auth middleware
- [ ] Add rate limiting (e.g., `slowapi`)
- [ ] Add structured logging middleware — log every query trace (chunk IDs, scores, latency, tokens) to Postgres
- [ ] Write integration tests: ingest a fixture doc via API, query it, assert expected chunk in response
- [ ] Dockerize the API (`Dockerfile`, add to `docker-compose.yml`)
- **Checkpoint:** `docker-compose up` brings up API + Postgres; you can `curl` `/query` and get a streamed, cited answer.

---

## Week 4 — Frontend

- [ ] Scaffold React app (Vite), Tailwind setup
- [ ] Build chat UI: message list, input box, streaming token rendering
- [ ] Build "Sources" panel component — shows retrieved chunks, scores, source doc/page per answer
- [ ] Wire up to the API (fetch + ReadableStream for SSE)
- [ ] Add feedback buttons (👍/👎) calling `/feedback`
- [ ] Basic auth flow (enter API key / login) matching backend auth
- [ ] Responsive/clean styling — this is a portfolio piece, it should look intentional (see frontend-design skill if building this with Claude's help)
- **Checkpoint:** full local flow works — open the frontend, ask a question, see a streamed, cited answer with sources.

---

## Week 5 — Observability, CI/CD, Deployment

- [ ] Add `/metrics` endpoint (latency, hit-rate, request count)
- [ ] Set up GitHub Actions: lint → unit tests → integration tests → (optional) eval smoke test → build Docker images
- [ ] Deploy Postgres+pgvector (Render/Railway/Neon)
- [ ] Deploy API (Render/Railway/Fly.io)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Set environment secrets on the hosting platform (never commit keys)
- [ ] Smoke-test the live deployed URL end-to-end
- **Checkpoint:** a public URL that works, linked from the README.

---

## Week 6 — Polish & Resume-Readiness

- [ ] Write the real README: problem statement, architecture diagram (reuse/simplify from ARCHITECTURE.md), setup instructions, live demo link, eval numbers, and a short "design tradeoffs" section
- [ ] Record a 60–90 second demo video/GIF for the README
- [ ] Clean commit history if needed going forward (don't rewrite past history — just keep future commits atomic and well-messaged, per best practice)
- [ ] Write a 2-minute verbal explanation of the project and practice it — you will be asked "walk me through a project" in every interview
- [ ] Add the project + live link + GitHub repo to your resume with a metrics-based bullet, e.g.:
  > "Built a full-stack RAG-based document Q&A system (FastAPI, React, pgvector) implementing hybrid dense+sparse retrieval; achieved 85% retrieval precision@5 on a hand-labeled eval set and deployed with CI/CD to a public endpoint."
- **Checkpoint:** project is resume-ready, demo-able live in an interview, and you can explain every architectural decision.

---

## Stretch Goals (only after the above is solid)

- [ ] Cross-encoder re-ranking stage after initial retrieval
- [ ] Swap generator to a self-hosted open-weight model served via vLLM
- [ ] Multi-hop retrieval for questions needing multiple documents
- [ ] Admin dashboard visualizing query logs and eval trends over time

---

## Weekly Discipline Checklist (repeat every week)

- [ ] Commit early and often, with meaningful messages (not one mega-commit)
- [ ] Push to GitHub — recent commit activity is something recruiters explicitly check
- [ ] Update PLAN.md checkboxes as you go — keep it honest, not aspirational
- [ ] If a week's checkpoint isn't met, don't skip ahead — a smaller, fully-working slice beats a bigger, broken one
