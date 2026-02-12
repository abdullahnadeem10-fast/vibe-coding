import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-lime-400 font-mono selection:bg-lime-900 selection:text-white p-4 md:p-8 flex flex-col gap-8">
      <header className="flex justify-between items-center border-b border-lime-800 pb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tighter">
          FUTURE WALLET <span className="text-lime-700">//</span> PROTOCOL_GEMINI
        </h1>
        <div className="hidden md:block text-xs text-lime-700 animate-pulse">
          ● SYSTEM_READY
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-lime-800 pt-4 text-xs text-lime-700 flex justify-between">
        <span>v.2.0.26-ALPHA</span>
        <span>NO RANDOMNESS DETECTED</span>
      </footer>
    </div>
  );
}
