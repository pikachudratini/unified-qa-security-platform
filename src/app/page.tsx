'use client';

import { useState } from 'react';
import { Activity, Bot, CheckCircle2, Code2, Database, Gauge, Lock, Play, ShieldCheck, Smartphone, Workflow, XCircle } from 'lucide-react';
import { profileConfig } from '@/lib/profiles';

type RunResponse = { runId: string; statusUrl: string; resultUrl: string };

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'green' | 'yellow' | 'red' | 'violet' }) {
  const classes = {
    slate: 'bg-white/10 text-white/70',
    green: 'bg-emerald-400/15 text-emerald-300',
    yellow: 'bg-yellow-400/15 text-yellow-200',
    red: 'bg-red-400/15 text-red-300',
    violet: 'bg-violet/20 text-violet-200',
  }[tone];
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{children}</span>;
}

function ScoreCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="glass rounded-3xl p-6">
      <Icon className="h-6 w-6 text-gold" />
      <p className="mt-4 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-white/50">{label}</p>
    </div>
  );
}

function RunLauncher() {
  const [url, setUrl] = useState('https://example.com');
  const [expectedText, setExpectedText] = useState('Example Domain');
  const [profile, setProfile] = useState<'fast' | 'full' | 'deep' | 'scheduled'>('fast');
  const [result, setResult] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startRun() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url, expectedText, profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Run failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass rounded-[34px] p-7 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Badge tone="green">Agent endpoint</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Manual test console</h2>
          <p className="mt-2 text-sm text-white/55">This panel is only a thin console for humans. In normal use, coding agents POST a target URL, profile, and expected assertions, then consume JSON and SARIF results.</p>
        </div>
        <Bot className="h-10 w-10 text-violet-300" />
      </div>

      <div className="mt-6 space-y-4">
        <label className="block text-sm text-white/60">Target URL
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet" />
        </label>
        <label className="block text-sm text-white/60">Expected text
          <input value={expectedText} onChange={(e) => setExpectedText(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet" />
        </label>
        <label className="block text-sm text-white/60">Profile
          <select value={profile} onChange={(e) => setProfile(e.target.value as 'fast' | 'full' | 'deep' | 'scheduled')} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet">
            {Object.keys(profileConfig).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <button onClick={startRun} disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet px-5 py-4 font-semibold text-white disabled:opacity-60">
          <Play className="h-4 w-4" /> {loading ? 'Running...' : 'Run QA + security harness'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {result && (
        <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <p className="font-semibold">Run created: {result.runId}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a href={result.statusUrl} className="underline">status JSON</a>
            <a href={result.resultUrl} className="underline">normalized report</a>
            <a href={`${result.statusUrl}/sarif`} className="underline">SARIF</a>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative px-6 py-20 md:py-28">
        <div className="absolute left-1/2 top-0 h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-violet/30 blur-[150px]" />
        <div className="relative mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Badge tone="violet">Internal agent backend</Badge>
            <h1 className="mt-6 text-5xl font-semibold leading-[.92] tracking-[-.075em] md:text-7xl">A QA and security service for coding agents, not an end-user app.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/62">Agents call this API after they build or edit software. It runs browser QA, accessibility, performance, SAST, SCA, secrets, and DAST checks, then returns machine-readable findings the agent can fix and retest.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Badge tone="green">Phase 1 working API</Badge>
              <Badge>Async run model</Badge>
              <Badge>SARIF output</Badge>
              <Badge>Gating policy</Badge>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <ScoreCard label="Run profiles" value="4" icon={Workflow} />
              <ScoreCard label="QA test types" value="7" icon={Smartphone} />
              <ScoreCard label="Security layers" value="5" icon={ShieldCheck} />
            </div>
          </div>
          <RunLauncher />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [Activity, 'QA engine', 'Smoke, functional, responsive, visual, accessibility, performance, and end-to-end checks across browser and viewport matrices.'],
            [Lock, 'Security engine', 'SAST, SCA, secrets, DAST, and container/IaC scan adapters mapped to OWASP Top 10 and SARIF.'],
            [Database, 'Result normalizer', 'Every tool becomes the same schema: stable finding IDs, severity, location, evidence, reproduction, remediation, and verdict.'],
            [Gauge, 'Gating policy', 'High or critical security findings, secrets, smoke failures, and Tier 1 functional failures block. Low findings warn.'],
            [Code2, 'Agent feedback loop', 'Agents call the API, poll status, fetch JSON/SARIF, patch code, and retest specific finding IDs. The human UI is optional.'],
            [ShieldCheck, 'Platform hardening', 'Sandboxing, tenant isolation, secrets management, audit logging, least privilege, outbound controls, and resource limits.'],
          ].map(([Icon, title, body]) => {
            const Cmp = Icon as React.ComponentType<{ className?: string }>;
            return (
              <div key={title as string} className="glass rounded-[28px] p-7">
                <Cmp className="h-7 w-7 text-gold" />
                <h3 className="mt-5 text-2xl font-semibold tracking-[-.03em]">{title as string}</h3>
                <p className="mt-3 text-white/55">{body as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-20 text-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[.24em] text-violet">Machine-readable output</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-.055em]">Built for agents, readable by humans.</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-7">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              <h3 className="mt-4 text-2xl font-semibold">Top-level verdict</h3>
              <p className="mt-2 text-slate-600">Unified score, QA subscore, security subscore, pass/fail verdict, duration, and matrix results.</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-7">
              <XCircle className="h-7 w-7 text-red-600" />
              <h3 className="mt-4 text-2xl font-semibold">Actionable findings</h3>
              <p className="mt-2 text-slate-600">Stable IDs, category, severity, status, exact location, evidence, reproduction, remediation, OWASP mapping, and SARIF.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
