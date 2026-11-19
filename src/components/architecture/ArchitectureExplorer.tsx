"use client";
import { useEffect, useRef, useState } from "react";
import { Workflow, X, Play, Pause, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./ArchitectureExplorer.module.css";

const flows = {
  Documents: [
    ["01", "Upload & extract", "PDF · DOCX · Text", "Your authenticated request uploads a private file. PDF and Word parsers extract its text; text-based formats are read directly."],
    ["02", "Chunk & embed", "MiniLM · 384 dimensions", "Text is split into 1,000-character chunks with 200-character overlap. Transformers.js runs MiniLM through ONNX to create normalized 384-dimensional vectors."],
    ["03", "Store & retrieve", "PostgreSQL · pgvector", "Chunks and embeddings are stored with their owner ID. A question is embedded with the same model, then vector similarity finds relevant passages."],
    ["04", "Ground & answer", "Groq · streamed response", "Retrieved passages and your question go to the language model. The answer streams back alongside source excerpts for you to inspect."],
  ],
  Analytics: [
    ["01", "Authorize owner", "Supabase Auth", "The server verifies your session and checks warehouse access. Guests and accounts outside the owner allowlist cannot query warehouse data."],
    ["02", "Generate SQL", "Natural language → SQL", "The language model receives the approved warehouse schema and translates a business question into a PostgreSQL SELECT query."],
    ["03", "Validate & execute", "Allowlist · read-only role", "The server parses SQL, restricts tables and functions, and executes through aetherq_reader in a read-only transaction with timeouts and a 200-row limit."],
    ["04", "Inspect results", "Rows · charts · SQL", "Results return to the workspace for inspection. Dashboard metrics are queried from the database; connection failures are shown rather than replaced with invented values."],
  ],
  Assistant: [
    ["01", "Ask a question", "React · TypeScript", "The workspace sends your message and recent conversation context to a Next.js API route."],
    ["02", "Verify & limit", "Session · shared quota", "The server verifies the Supabase session and checks a database-backed request quota before contacting the AI provider."],
    ["03", "Stream reasoning", "Groq · AI SDK", "The language model generates an answer. Server-sent events deliver text incrementally, with explicit handling for provider failures."],
    ["04", "Keep the thread", "Supabase · private history", "The interface renders Markdown and saves conversation history under your account. Document and analytics modes use their own specialized pipelines."],
  ],
};
type Flow = keyof typeof flows;

export function ArchitectureExplorer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<Flow>("Documents");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const nodes = flows[flow];
  const close = () => { setOpen(false); setPlaying(false); dialog.current?.close(); };
  useEffect(() => {
    if (!open || !playing) return;
    const timer = setInterval(() => setStep(n => (n + 1) % 4), 3500);
    return () => clearInterval(timer);
  }, [open, playing]);
  return <>
    <button type="button" className={styles.trigger} title="How AetherQ works" aria-label="How AetherQ works: project and architecture" onClick={() => { setOpen(true); dialog.current?.showModal(); }}><Workflow size={18}/></button>
    <dialog ref={dialog} aria-label="AetherQ project and architecture" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }} className={styles.dialog}>
      {open && <div className={styles.content}>
        <header className={styles.header}><span className={styles.eyebrow}>AETHERQ / UNDER THE HOOD</span><button type="button" onClick={close} aria-label="Close architecture" className={styles.trigger}><X size={20}/></button></header>
        <h2 className={styles.title}>From information<br/><span>to understanding.</span></h2>
        <p className={styles.intro}>A modular AI workspace that connects private documents, authorized business data, and conversations—so you can find answers without switching between files, SQL tools, and chat.</p>
        <div className={styles.controls}><div className={styles.tabs} aria-label="Architecture workflows">{(Object.keys(flows) as Flow[]).map(name => <button type="button" key={name} aria-pressed={flow === name} onClick={() => { setFlow(name); setStep(0); setPlaying(false); }}>{name}</button>)}</div><button type="button" className={styles.play} aria-pressed={playing} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={14}/> : <Play size={14}/>} {playing ? "Pause tour" : "Play flow"}</button></div>
        <p className={styles.caption}>Interactive system diagram · select a stage to explore · illustrative flow, not live telemetry</p>
        <div className={styles.diagram} aria-label={`${flow} processing pipeline`}>{nodes.map(([number, title, tech], i) => <div key={title} className={styles.stage}>
          <button type="button" aria-pressed={step === i} onClick={() => { setStep(i); setPlaying(false); }} className={`${styles.node} ${step === i ? styles.active : ""}`}><span className={styles.number}>{number}</span><strong>{title}</strong><small>{tech}</small></button>
          {i < 3 && <span className={`${styles.connector} ${playing && step === i ? styles.moving : ""}`} aria-hidden="true"><ArrowRight size={18}/></span>}
        </div>)}</div>
        <section className={styles.explanation} aria-live={playing ? "off" : "polite"}><span className={styles.eyebrow}>STAGE {step + 1} / 4</span><h3>{nodes[step][1]}</h3><p>{nodes[step][3]}</p></section>
        <footer className={styles.footer}><div><ShieldCheck size={18}/><span>Private storage · owner-scoped documents · restricted warehouse queries</span></div><p>React + Next.js → Server API → Supabase / PostgreSQL + pgvector → Groq<br/>Deployed on Vercel. MiniLM inference runs on the server.</p></footer>
      </div>}
    </dialog>
  </>;
}
