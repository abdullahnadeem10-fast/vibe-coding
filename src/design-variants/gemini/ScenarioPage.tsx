import React from 'react';
import Layout from './components/Layout';

export default function ScenarioPage({ params }: { params: { id: string } }) {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 text-sm text-lime-700">
            <span>SCENARIOS</span> 
            <span>/</span>
            <span className="text-lime-400 font-bold">kernal_id_{params?.id || '000'}</span>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[70vh]">
            <div className="col-span-3 border-r border-lime-800 pr-6 space-y-8">
                <div>
                    <h1 className="text-4xl font-black mb-2">RETIRE_EARLY</h1>
                    <div className="text-xs font-mono text-lime-600">ID: {params?.id}</div>
                </div>
                
                <div className="space-y-4">
                    <div className="text-xs uppercase font-bold text-white/50">Details</div>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div className="text-lime-600">Created</div>
                        <div>2024-02-12</div>
                        <div className="text-lime-600">Horizon</div>
                        <div>10 Years</div>
                        <div className="text-lime-600">Events</div>
                        <div>4 Active</div>
                    </div>
                </div>

                <div className="pt-8 border-t border-lime-800">
                    <button className="w-full border border-lime-500 text-lime-500 py-2 hover:bg-lime-500 hover:text-black">
                        EDIT PARAMS
                    </button>
                    <button className="w-full text-lime-700 py-2 mt-2 text-xs hover:text-white">
                        DELETE_SCENARIO
                    </button>
                </div>
            </div>

            <div className="col-span-9 flex flex-col gap-4">
                <div className="bg-neutral-900 border border-lime-800 h-1/2 flex items-center justify-center relative">
                    <div className="absolute top-2 left-2 text-xs font-mono text-lime-600">PROJECTION_GRAPH</div>
                    <div className="text-4xl font-black opacity-10">GRAPH VIEW</div>
                </div>

                <div className="grid grid-cols-2 gap-4 h-1/2">
                    <div className="bg-neutral-900 border border-lime-800 p-4">
                        <div className="text-xs font-mono text-lime-600 mb-2">INCOME STREAMS</div>
                        <ul className="text-sm space-y-2">
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>Salary (Main)</span>
                                <span className="font-mono">$85,000</span>
                            </li>
                             <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>Side Project</span>
                                <span className="font-mono">$12,000</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-neutral-900 border border-lime-800 p-4">
                         <div className="text-xs font-mono text-lime-600 mb-2">MAJOR EXPENSES</div>
                         <ul className="text-sm space-y-2">
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>Rent</span>
                                <span className="font-mono">$24,000</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
