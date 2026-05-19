"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/chat");
    }
  }, [isLoading, isAuthenticated, router]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const googleAuthUrl = `${API_URL}/auth/google`;

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-pearl-50 flex items-center justify-center">
        <div className="size-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background geometry */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-stone-200/30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-stone-100/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-stone-100/10"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-[2rem] p-10 md:p-12 border border-white/60 shadow-levitate flex flex-col items-center text-center gap-8">

          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="size-14 rounded-2xl bg-sand-900 flex items-center justify-center shadow-levitate">
              <svg className="size-7 text-pearl-50" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 24 L16 8 L24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M10.5 19 L21.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-thin font-serif text-sand-900 tracking-wide">Overdrive</h1>
              <p className="text-[10px] text-stone-400 uppercase tracking-[0.25em] font-medium mt-1">AI · Google Drive</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-stone-100"></div>

          {/* Copy */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-light font-serif text-sand-900 tracking-wide">
              Sign in to continue
            </h2>
            <p className="text-stone-500 text-sm font-light tracking-wide leading-relaxed max-w-xs">
              Connect your Google account to sync your Drive and start querying documents instantly.
            </p>
          </div>

          {/* Google OAuth button */}
          <a
            href={googleAuthUrl}
            className="w-full flex items-center justify-center gap-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-full h-14 px-8 text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98] group"
          >
            <svg className="size-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <a href="/" className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest font-medium">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
