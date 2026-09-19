import React, { useState, useEffect } from 'react';
import { BookOpen, Database, Sparkles, CheckCircle2, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export default function App() {
  const [apiStatus, setApiStatus] = useState({ status: 'checking', message: 'Checking API...' });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setApiStatus({ status: 'connected', version: data.version, timestamp: data.timestamp });
      })
      .catch((err) => {
        // Fallback check to direct port if proxy isn't set up
        fetch('http://localhost:8000/health')
          .then((res) => res.json())
          .then((data) => {
            setApiStatus({ status: 'connected', version: data.version, timestamp: data.timestamp });
          })
          .catch(() => {
            setApiStatus({ status: 'disconnected', message: 'API offline or starting up' });
          });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">DocuMind</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
                Week 0
              </span>
            </div>
            <p className="text-xs text-slate-400">Production RAG grounded in Lewis et al. (NeurIPS 2020)</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus.status === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : apiStatus.status === 'checking'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="text-slate-300">
              API: {apiStatus.status === 'connected' ? `Online (v${apiStatus.version})` : apiStatus.message}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Non-parametric Memory + Parametric Generator</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Verifiable, Cited Document Intelligence
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            DocuMind bridges dense vector retrieval with instruction-tuned generative LLMs to answer complex questions over a domain corpus with explicit citation provenance.
          </p>
        </section>

        {/* System Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-3 hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Foundational Corpus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated benchmark of 15 landmark NLP & RAG research papers (Lewis et al. 2020, DPR, REALM, ColBERT, etc.).
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-3 hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Hybrid Retrieval Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cosine similarity over pgvector combined with BM25 sparse keyword ranking via Reciprocal Rank Fusion (RRF).
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-3 hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Hallucination Guardrails</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Confidence threshold checks, strict citation matching, and fallback responses when retrieved evidence is insufficient.
            </p>
          </div>
        </section>

        {/* Milestone Status */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-teal-400" />
              <h2 className="font-semibold text-white">Week 0 Milestone Status</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Skeleton Ready</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-300 bg-slate-950/60 px-3 py-2 rounded border border-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Corpus: Lewis et al. (2020) RAG Paper</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 bg-slate-950/60 px-3 py-2 rounded border border-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Backend: FastAPI + Health endpoint</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 bg-slate-950/60 px-3 py-2 rounded border border-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Frontend: React + Vite + Tailwind</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 bg-slate-950/60 px-3 py-2 rounded border border-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Orchestration: docker-compose.yml (pgvector)</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        DocuMind · Engineered by Siddharth Singh · MIT License
      </footer>
    </div>
  );
}
