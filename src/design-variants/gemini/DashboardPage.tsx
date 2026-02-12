import React from 'react';
import Layout from './components/Layout';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex justify-between items-end border-b border-white/10 pb-4">
           <div>
             <h2 className="text-3xl font-black">OVERVIEW</h2>
             <p className="text-lime-600 text-sm">USER: PILOT_01</p>
           </div>
           <button className="border border-lime-500 text-lime-500 px-4 py-2 hover:bg-lime-500 hover:text-black">
             + NEW_SCENARIO
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['NET WORTH', 'LIQUIDITY', 'DEBT', 'RUNWAY'].map((label) => (
                <div key={label} className="bg-neutral-900 border border-lime-800 p-6 flex flex-col justify-between h-32 hover:border-lime-500 transition-colors cursor-pointer group">
                    <span className="text-xs text-lime-700 group-hover:text-lime-500">{label}</span>
                    <span className="text-2xl font-mono tracking-tighter">$842,050.00</span>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-lime-800 p-6 min-h-[300px]">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-lime-500 rounded-full"></span> 
                    ACTIVE SCENARIOS
                </h3>
                <ul className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <li key={i} className="flex justify-between items-center bg-white/5 p-3 border-l-2 border-transparent hover:border-lime-500">
                            <div>
                                <div className="font-bold">Scenario_Alpha_{i}</div>
                                <div className="text-xs text-neutral-500">Last run: T-{i*4}h</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lime-400 font-mono">OK</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border border-lime-800 p-6 min-h-[300px]">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span> 
                    ALERTS
                </h3>
                 <div className="p-4 bg-amber-900/10 border border-amber-900/50 text-amber-500 text-sm mb-2">
                    ⚠ DETECTED: Savings rate drop below 15% in Q3 2026.
                 </div>
                 <div className="p-4 bg-lime-900/10 border border-lime-900/50 text-lime-500 text-sm">
                    ✓ Milestone: "Debt Free" achieved in Scenario B.
                 </div>
            </div>

        </div>
      </div>
    </Layout>
  );
}
