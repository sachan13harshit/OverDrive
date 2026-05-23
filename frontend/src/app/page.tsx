import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const MARQUEE_ITEMS = [
  "Next.js 15", "·", "OpenAI GPT-4o", "·", "pgvector", "·",
  "Retrieval-Augmented Generation", "·", "Google Drive", "·", "Prisma ORM", "·",
  "Server-Sent Events", "·", "tiktoken", "·", "Neon Postgres", "·",
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col w-full overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="w-full min-h-[92vh] flex flex-col justify-between px-6 md:px-16 lg:px-24 pt-16 pb-0 border-b border-stone-100/60">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">

            {/* Left: headline */}
            <div className="flex flex-col gap-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-mono font-medium text-stone-400 uppercase tracking-[0.3em]">
                  v1.0 · Open Beta
                </span>
              </div>
              <h1 className="font-serif font-thin tracking-tight text-sand-900 leading-[0.95]"
                style={{ fontSize: "clamp(4rem, 12vw, 10rem)" }}>
                Ask your<br />
                <em className="font-normal not-italic" style={{ WebkitTextStroke: "1px currentColor", color: "transparent" }}>Drive.</em>
              </h1>
              <p className="text-stone-500 text-base md:text-lg font-light leading-loose tracking-wide max-w-lg">
                Overdrive indexes your Google Drive documents and answers questions with citations traced to the exact source, grounded in retrieval — no hallucinated answers.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a href="/login"
                  className="inline-flex items-center justify-center rounded-full h-12 px-10 bg-sand-900 hover:bg-stone-850 text-pearl-50 text-[11px] uppercase tracking-[0.2em] font-medium transition-all shadow-levitate hover:-translate-y-px">
                  Get Started →
                </a>
                <span className="text-[11px] text-stone-400 font-light tracking-wide">
                  No credit card · Google OAuth only
                </span>
              </div>
            </div>

            {/* Right: rag pipeline log visualization */}
            <div className="w-full lg:w-[420px] shrink-0 self-end">
              <div className="rounded-t-2xl overflow-hidden border border-stone-200/50 border-b-0 shadow-float bg-white/60 backdrop-blur-xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-stone-50/80 border-b border-stone-100">
                  <div className="size-2.5 rounded-full bg-rose-300/70"></div>
                  <div className="size-2.5 rounded-full bg-amber-300/70"></div>
                  <div className="size-2.5 rounded-full bg-emerald-300/70"></div>
                  <span className="text-[10px] font-mono text-stone-400 ml-2 tracking-widest uppercase">rag · session</span>
                </div>
                <div className="p-5 flex flex-col gap-3 font-mono text-[11px]">
                  <div className="text-stone-400">&gt; query: &quot;Summarize the hiring plan for Q4&quot;</div>
                  <div className="text-stone-300">──────────────────────────</div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    <span className="text-stone-500">embed query → 1536-dim vector</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    <span className="text-stone-500">search chunks via pgvector (top 20, threshold 0.4)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    <span className="text-stone-500">retrieved 5 files · 10 chunks</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 shrink-0 animate-pulse">◉</span>
                    <span className="text-stone-600">generating grounded answer...</span>
                  </div>
                  <div className="mt-2 p-3 rounded-xl bg-stone-50/80 border border-stone-100 text-stone-700 font-sans font-light text-xs leading-relaxed">
                    The Q4 hiring plan focuses on 12 engineering roles across backend and ML, with a budget of $2.4M approved in the Sept board meeting.
                  </div>
                  <div className="flex gap-2 mt-1">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-stone-100 text-[10px] text-stone-400 font-sans">
                      <span className="material-symbols-outlined text-[11px]">description</span>
                      Hiring_Plan_Q4.docx
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-stone-100 text-[10px] text-stone-400 font-sans">
                      <span className="material-symbols-outlined text-[11px]">description</span>
                      Board_Sept.pdf
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Display word */}
          <div className="select-none overflow-hidden mt-8 -mx-6 md:-mx-16 lg:-mx-24">
            <p className="font-serif font-thin text-stone-100/80 whitespace-nowrap leading-none tracking-tighter"
              style={{ fontSize: "clamp(6rem, 22vw, 18rem)" }}>
              OVERDRIVE
            </p>
          </div>
        </section>

        {/* ── Marquee ── */}
        <div className="w-full border-b border-stone-100/60 py-4 overflow-hidden bg-stone-50/30">
          <div className="flex gap-8 animate-marquee whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="text-[10px] font-mono font-medium text-stone-400 uppercase tracking-[0.2em] shrink-0">
                {item}
              </span>
            ))}
          </div>
          <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>

        {/* ── Bento features ── */}
        <section className="w-full max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24 py-28">
          <div className="flex flex-col gap-3 mb-16">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.3em]">// capabilities</span>
            <h2 className="font-serif font-thin text-sand-900 text-4xl md:text-5xl tracking-tight">
              Everything you need,<br />nothing you don&apos;t.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Wide card — RAG pipeline */}
            <div className="md:col-span-8 glass-card rounded-[2rem] p-8 md:p-10 border border-white/60 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">01 · Inline RAG Pipeline</span>
                <span className="material-symbols-outlined text-stone-300 text-[24px] font-thin">hub</span>
              </div>
              <h3 className="font-serif font-light text-sand-900 text-2xl md:text-3xl">
                Sync → Chunk → Embed → Retrieve
              </h3>
              <p className="text-stone-500 font-light text-sm leading-loose tracking-wide max-w-lg">
                Documents are fetched from Drive, chunked at 800 tokens with 100-token overlap, embedded via OpenAI&apos;s <code className="text-[11px] bg-stone-100 px-1.5 py-0.5 rounded font-mono">text-embedding-3-small</code>, and stored in Postgres via pgvector — all inline. No background workers, no queues.
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {["PDF", "DOCX", "Google Docs", "Plain Text"].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-stone-100/60 text-[10px] font-medium text-stone-500 uppercase tracking-widest border border-stone-200/50">{t}</span>
                ))}
              </div>
            </div>

            {/* Tall card — grounded answers */}
            <div className="md:col-span-4 bg-sand-900 rounded-[2rem] p-8 border border-stone-800 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">02 · Grounded</span>
                <span className="material-symbols-outlined text-stone-500 text-[24px] font-thin">psychology</span>
              </div>
              <h3 className="font-serif font-light text-pearl-50 text-2xl">
                Retrieve, then answer
              </h3>
              <p className="text-stone-400 font-light text-sm leading-loose tracking-wide">
                One retrieval pass over your Drive, then a single grounded completion. No hallucinated multi-step reasoning — if it&apos;s not in your Drive, it says so.
              </p>
              <div className="mt-auto space-y-2 font-mono text-[10px] text-stone-500">
                <div className="flex gap-2"><span className="text-stone-600">→</span> Search: drive_retrieve</div>
                <div className="flex gap-2"><span className="text-stone-600">→</span> Context: top-scoring chunks</div>
                <div className="flex gap-2"><span className="text-emerald-600">→</span> Answer: grounded + cited</div>
              </div>
            </div>

            {/* Small card — Citations */}
            <div className="md:col-span-4 glass-card rounded-[2rem] p-7 border border-white/60 flex flex-col gap-4">
              <span className="material-symbols-outlined text-stone-300 text-[24px] font-thin">link</span>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">03 · Citations</span>
              <h3 className="font-serif font-light text-sand-900 text-xl">Every answer, sourced.</h3>
              <p className="text-stone-500 font-light text-xs leading-loose tracking-wide">
                Click any citation chip to preview the exact Drive document in a full-screen modal.
              </p>
            </div>

            {/* Small card — SSE streaming */}
            <div className="md:col-span-4 glass-card rounded-[2rem] p-7 border border-white/60 flex flex-col gap-4">
              <span className="material-symbols-outlined text-stone-300 text-[24px] font-thin">stream</span>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">04 · Live streaming</span>
              <h3 className="font-serif font-light text-sand-900 text-xl">Watch it search and answer.</h3>
              <p className="text-stone-500 font-light text-xs leading-loose tracking-wide">
                Retrieval and generation status stream live via Server-Sent Events. No polling, no waiting for a final response.
              </p>
            </div>

            {/* Small card — Auth */}
            <div className="md:col-span-4 glass-card rounded-[2rem] p-7 border border-white/60 flex flex-col gap-4">
              <span className="material-symbols-outlined text-stone-300 text-[24px] font-thin">lock</span>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">05 · Auth</span>
              <h3 className="font-serif font-light text-sand-900 text-xl">Google OAuth + JWT.</h3>
              <p className="text-stone-500 font-light text-xs leading-loose tracking-wide">
                One-click Google sign-in. Your Drive token is scoped read-only and never stored.
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works — editorial numbered ── */}
        <section id="how-it-works" className="w-full border-t border-stone-100/60 py-28 bg-stone-50/30">
          <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.3em]">// how it works</span>
            <div className="mt-16 flex flex-col divide-y divide-stone-100/80">
              {[
                {
                  n: "01",
                  title: "Sign in with Google",
                  body: "OAuth 2.0 grants Overdrive read-only access to your Drive. Your files never leave Google's servers until you click Sync.",
                },
                {
                  n: "02",
                  title: "Sync & vectorize your documents",
                  body: "Hit Sync Now in the sidebar. Files are fetched, chunked at 800 tokens, embedded, and stored in Postgres via pgvector — all in a single inline request.",
                },
                {
                  n: "03",
                  title: "Ask a question",
                  body: "Type anything in the chat. Overdrive retrieves the most semantically relevant chunks and generates a grounded answer with file citations.",
                },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex flex-col md:flex-row md:items-start gap-6 py-10 group">
                  <span className="font-mono text-stone-100 font-medium shrink-0 select-none transition-colors group-hover:text-stone-200"
                    style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1 }}>
                    {n}
                  </span>
                  <div className="flex flex-col gap-3 pt-2 md:pt-4">
                    <h3 className="font-serif font-light text-sand-900 text-2xl md:text-3xl tracking-tight">{title}</h3>
                    <p className="text-stone-500 font-light text-sm leading-loose tracking-wide max-w-xl">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full px-6 md:px-16 lg:px-24 py-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="w-full bg-sand-900 rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-stone-800/60 blur-[80px]"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-stone-700/40 blur-[80px]"></div>
                <div className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
                </div>
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 px-10 md:px-16 py-16 md:py-20">
                <div className="flex flex-col gap-4 max-w-lg">
                  <h2 className="font-serif font-thin text-pearl-50 text-4xl md:text-5xl tracking-tight leading-tight">
                    Your documents are waiting to answer you.
                  </h2>
                  <p className="text-stone-400 font-light text-sm leading-loose tracking-wide">
                    Connect your Google Drive in under a minute and start querying instantly.
                  </p>
                </div>
                <a href="/login"
                  className="shrink-0 inline-flex items-center justify-center rounded-full h-14 px-12 bg-white hover:bg-pearl-100 text-sand-900 text-[11px] uppercase tracking-[0.2em] font-medium transition-all shadow-levitate hover:-translate-y-px whitespace-nowrap">
                  Sign in with Google →
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
