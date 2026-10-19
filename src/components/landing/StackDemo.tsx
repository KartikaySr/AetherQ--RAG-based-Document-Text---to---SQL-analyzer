"use client";

import { useState, type KeyboardEvent } from "react";
import { Database, FileText, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import styles from "./StackDemo.module.css";

const modules = [
  { title: "Documents", icon: FileText },
  { title: "Analytics", icon: Database },
  { title: "Assistant", icon: MessageSquare },
];
const examples = [
  { question: "What changed this quarter?", answer: "The pilot expanded from 3 teams to 8, and onboarding time fell from 5 days to 2.", source: "The Q3 pilot now serves eight teams, up from three in Q2. The revised onboarding flow reduced setup from five days to two.", page: 4 },
  { question: "What should we focus on next?", answer: "Improve source coverage and assign a knowledge owner to each team before expanding the pilot.", source: "Next quarter: close source coverage gaps and nominate a knowledge owner per team before the next rollout.", page: 7 },
];
const regions = [
  { name: "North", revenue: 84, growth: 12 },
  { name: "West", revenue: 65, growth: 22 },
  { name: "South", revenue: 48, growth: 16 },
  { name: "East", revenue: 32, growth: 8 },
];

export function StackDemo() {
  const [active, setActive] = useState(0);
  const [question, setQuestion] = useState(0);
  const [source, setSource] = useState(false);
  const [metric, setMetric] = useState<"revenue" | "growth">("revenue");
  const [followup, setFollowup] = useState(false);

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % 3
      : event.key === "ArrowLeft" ? (index + 2) % 3
      : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`preview-tab-${next}`)?.focus();
  }

  return <div id="interactive-stack" className={styles.demo}>
    <div className={styles.topline}><span>INTERACTIVE PREVIEW</span><span>Sample data · No sign-up</span></div>
    <div className={styles.tabs} role="tablist" aria-label="Explore the stack">
      {modules.map((item, index) => <button key={item.title} id={`preview-tab-${index}`} role="tab" aria-selected={active === index} aria-controls="preview-panel" tabIndex={active === index ? 0 : -1} onKeyDown={event => navigateTabs(event, index)} onClick={() => setActive(index)}><item.icon size={16}/>{item.title}</button>)}
    </div>
    <div className={styles.panel} id="preview-panel" role="tabpanel" aria-labelledby={`preview-tab-${active}`} tabIndex={0}>
      <div key={active} className={styles.enter}>
        {active === 0 && <>
          <p className={styles.eyebrow}>FROM SOURCE TO CITED ANSWER</p>
          <div className={styles.file}><FileText size={24}/><div><strong>Quarterly review.pdf</strong><small>8 pages · Example document</small></div></div>
          <p className={styles.label}>Choose a question</p>
          <div className={styles.prompts}>{examples.map((example, index) => <button key={example.question} aria-pressed={question === index} onClick={() => {setQuestion(index); setSource(false);}}>{example.question}<ArrowRight size={14}/></button>)}</div>
          <div className={styles.answer} aria-live="polite"><Sparkles size={18}/><p>{examples[question].answer}</p></div>
          <button className={styles.sourceButton} aria-expanded={source} aria-controls="sample-source" onClick={() => setSource(!source)}>{source ? "Hide" : "Inspect"} source · Page {examples[question].page}<span>{source ? "−" : "+"}</span></button>
          {source && <blockquote id="sample-source" className={styles.source}>“{examples[question].source}”</blockquote>}
        </>}
        {active === 1 && <>
          <p className={styles.eyebrow}>FROM QUESTION TO EVIDENCE</p>
          <h2 className={styles.question}>{metric === "revenue" ? "Which regions generated the most revenue?" : "Which regions grew the fastest?"}</h2>
          <div className={styles.prompts}><button aria-pressed={metric === "revenue"} onClick={() => setMetric("revenue")}>Revenue</button><button aria-pressed={metric === "growth"} onClick={() => setMetric("growth")}>Growth</button></div>
          <div className={styles.chart} aria-label={`Sample regional ${metric}`}>
            {[...regions].sort((a,b) => b[metric] - a[metric]).map(region => <div className={styles.row} key={region.name}><span>{region.name}</span><div><i style={{width:`${metric === "revenue" ? region.revenue : region.growth * 4}%`}}/></div><strong>{metric === "revenue" ? `$${region.revenue}k` : `${region.growth}%`}</strong></div>)}
          </div>
          <details className={styles.sql}><summary>Inspect example SQL</summary><pre><code>{metric === "revenue" ? "SELECT region, SUM(revenue)\nFROM quarterly_sales\nGROUP BY region\nORDER BY SUM(revenue) DESC;" : "SELECT region, growth_percent\nFROM quarterly_growth\nORDER BY growth_percent DESC;"}</code></pre></details>
          <p className={styles.note}>Illustrative results. Live warehouse access requires authorization.</p>
        </>}
        {active === 2 && <>
          <p className={styles.eyebrow}>FROM IDEAS TO NEXT STEPS</p>
          <div className={styles.file}>Help me plan a knowledge-sharing pilot.</div>
          <div className={styles.answer}><Sparkles size={18}/><p>Choose one team, collect a focused set of sources, and assign an owner. Measure whether people find answers faster.</p></div>
          {!followup ? <button className={styles.sourceButton} onClick={() => setFollowup(true)}>Turn that into a one-week plan <ArrowRight size={16}/></button> : <div aria-live="polite" className={styles.enter}><div className={styles.file}>Turn that into a one-week plan.</div><div className={styles.answer}><Sparkles size={18}/><p><strong>Days 1–2:</strong> choose the team and sources.<br/><strong>Days 3–4:</strong> test real questions and record gaps.<br/><strong>Day 5:</strong> review results and next steps.</p></div><button className={styles.reset} onClick={() => setFollowup(false)}>Reset preview</button></div>}
          <p className={styles.note}>Scripted preview. Open your workspace to use the live assistant.</p>
        </>}
      </div>
    </div>
    <div className={styles.bottom}><span>Source → Context → Understanding</span><span>0{active + 1} / 03</span></div>
  </div>;
}
