import React from 'react';
import Layout from './components/Layout';

export default function DemoPage() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6 border-r border-lime-800 pr-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold bg-lime-900/40 p-2 border-l-2 border-lime-500">
              INITIAL_STATE
            </h3>
            <div className="space-y-2">
              <label className="block text-xs uppercase text-lime-600">Checking Balance</label>
              <input type="text" defaultValue="5,000" className="w-full bg-neutral-900 border border-lime-700 p-2 font-mono focus:outline-none focus:border-lime-400 text-right" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs uppercase text-lime-600">Monthly Income</label>
              <input type="text" defaultValue="4,200" className="w-full bg-neutral-900 border border-lime-700 p-2 font-mono focus:outline-none focus:border-lime-400 text-right" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold bg-lime-900/40 p-2 border-l-2 border-lime-500">
              PARAMETERS
            </h3>
            <div className="space-y-2">
              <label className="block text-xs uppercase text-lime-600">Sim Horizon (Days)</label>
              <input type="range" className="w-full accent-lime-500" />
            </div>
            <div className="flex justify-between text-xs">
              <span>NOW</span>
              <span>5 YR</span>
            </div>
          </div>

          <button className="w-full bg-lime-500 text-neutral-950 font-bold py-4 hover:bg-lime-400 mt-8">
            RUN_SIMULATION()
          </button>
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="border border-lime-800 h-[400px] relative bg-neutral-900/50 p-4">
            <div className="absolute top-2 right-2 text-xs text-lime-700">DISPLAY: LIQUIDITY</div>
            {/* Mock Chart Lines */}
            <div className="w-full h-full flex items-end justify-between gap-1 opacity-80">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="bg-lime-500/20 hover:bg-lime-500" style={{ width: '4%', height: `${Math.random() * 80 + 10}%` }}></div>
                ))}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
             <div className="bg-neutral-900 p-4 border border-lime-800">
                <div className="text-xs text-lime-600">MIN_BALANCE</div>
                <div className="text-xl font-bold font-mono">$2,450</div>
             </div>
             <div className="bg-neutral-900 p-4 border border-lime-800">
                <div className="text-xs text-lime-600">MAX_DRAWDOWN</div>
                <div className="text-xl font-bold font-mono">-12.4%</div>
             </div>
             <div className="bg-neutral-900 p-4 border border-lime-800">
                <div className="text-xs text-lime-600">FINAL_ASSETS</div>
                <div className="text-xl font-bold font-mono">$142k</div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
