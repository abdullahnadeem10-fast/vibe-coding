import React from 'react';
import Layout from './components/Layout';

export default function LandingPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="border border-lime-500/50 p-8 md:p-12 max-w-4xl w-full text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-lime-900/10 pointer-events-none group-hover:bg-lime-900/20 transition-colors" />
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight relative z-10">
            DETERMINISTIC<br />WEALTH ENGINE
          </h2>
          
          <p className="text-lime-300/80 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Eliminate uncertainty. Simulate your financial future with bit-perfect precision. 
            No Monte Carlo. No guessing.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
            <button className="bg-lime-500 text-neutral-950 px-8 py-3 font-bold hover:bg-lime-400 transition-transform active:translate-y-1">
              [ ENTER SIMULATION ]
            </button>
            <button className="border border-lime-500 px-8 py-3 text-lime-500 hover:bg-lime-900/30 transition-colors">
              READ_MANIFESTO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-xs text-lime-600 opacity-60">
          <div>
            <span className="block text-xl font-bold">0.00%</span>
            VARIANCE
          </div>
          <div>
            <span className="block text-xl font-bold">5yr</span>
            HORIZON
          </div>
          <div>
            <span className="block text-xl font-bold">100%</span>
            LOCAL
          </div>
        </div>
      </div>
    </Layout>
  );
}
