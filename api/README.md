# DocuMind API Service

FastAPI-powered backend for the DocuMind RAG system.

## Setup & Running

```bash
uv pip install -e ".[dev]"
pytest
uvicorn src.main:app --reload --port 8000
```
