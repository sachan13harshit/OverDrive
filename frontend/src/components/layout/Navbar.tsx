export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-pearl-50/60 backdrop-blur-xl px-6 lg:px-24 py-4 transition-all">
      <div className="flex items-center gap-3">
        <svg className="size-7 text-sand-900" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 24 L16 8 L24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M10.5 19 L21.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        <h2 className="text-sand-900 text-2xl font-serif font-light tracking-wide">Overdrive</h2>
      </div>
      <div className="hidden md:flex flex-1 justify-end gap-10 items-center">
        <nav className="flex items-center gap-8">
          <a className="text-sand-900/50 hover:text-sand-900 transition-colors text-xs font-medium uppercase tracking-[0.2em]" href="/login">Sign In</a>
        </nav>
        <a href="/login" className="flex items-center justify-center overflow-hidden rounded-full h-10 px-7 bg-sand-900 hover:bg-stone-850 text-pearl-50 text-xs font-medium uppercase tracking-[0.15em] transition-all shadow-button hover:shadow-lg">
          Get Started
        </a>
      </div>
      <div className="md:hidden">
        <a href="/login" className="text-sand-900/70 text-xs font-medium uppercase tracking-widest">Sign In</a>
      </div>
    </header>
  );
}
