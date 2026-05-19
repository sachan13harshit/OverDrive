export default function Footer() {
  return (
    <footer className="border-t border-white/30 bg-white/20 backdrop-blur-xl py-16 px-6 md:px-24 mt-20">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-sand-900">
            <svg className="size-6 opacity-70" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 24 L16 8 L24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M10.5 19 L21.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
            <span className="font-serif text-xl tracking-wide font-light">Overdrive</span>
          </div>
          <p className="text-stone-400 font-light text-sm max-w-xs leading-loose tracking-wide">
            Google Drive documents, queryable through retrieval-augmented search.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-right">
          <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-medium">Built with</span>
          <div className="flex flex-wrap gap-3 justify-end">
            {["Next.js", "OpenAI", "pgvector", "Prisma"].map(tech => (
              <span key={tech} className="text-[10px] text-stone-500 px-2.5 py-1 rounded-full border border-stone-200/60 font-medium uppercase tracking-wider">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
