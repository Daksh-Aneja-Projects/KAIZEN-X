"use client"

import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/lib/api'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, ComposedChart, Line } from 'recharts'
import { Activity, Play, Settings, AlertTriangle, Route, Crosshair, TrendingDown, Target, HelpCircle, Binary, Database } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FutureObservatory() {
  const [selectedCluster, setSelectedCluster] = useState<any>(null)
  
  const { data: clusters } = useQuery({
    queryKey: ['outcomes'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/futures/outcomes`)
      return res.json()
    },
    refetchInterval: 1000
  })

  const clusterColors: any = {
    "Winning Futures": "var(--color-success)",
    "Acceptable Futures": "var(--color-primary)",
    "Failing Futures": "var(--color-warning)",
    "Catastrophic Futures": "var(--color-critical)"
  }

  const { data: distributionData } = useQuery({
    queryKey: ['distribution'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/futures/distribution`)
      return res.json()
    },
    refetchInterval: 1000
  })

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[var(--color-background)] p-6 overflow-hidden">
      
      {/* Header Meta Strip */}
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-2 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white uppercase flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-[var(--color-primary)]" />
            Future Observatory
          </h1>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mt-1">Monte Carlo Simulation Engine // 10K Iterations</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-sm text-[10px] font-mono font-bold tracking-widest flex items-center gap-2 border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/20 transition-colors uppercase">
            <Play className="w-3 h-3" /> Execute Sequence
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        
        {/* Main Observation Space (Left) */}
        <div className="col-span-8 flex flex-col gap-6 h-full">
          
          <div className="flex-1 bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex flex-col relative overflow-hidden group">
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                 <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-primary)]">Outcome Space Map</h3>
                 <p className="text-[9px] text-[var(--color-text-muted)] font-mono mt-1">10,000 Simulations / Dimension Reduction</p>
               </div>
               <div className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest border border-[var(--color-border-subtle)] px-2 py-1 bg-black/50">
                  X: Cost • Y: Probability • Z: Density
               </div>
             </div>
             
             {/* Reticle decorations */}
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--color-primary)] opacity-50"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--color-primary)] opacity-50"></div>


             <div className="flex-1 w-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                   <XAxis type="number" dataKey="coords.cost" stroke="var(--color-border-active)" tick={{fontSize: 9, fontFamily: 'monospace', fill: 'var(--color-text-muted)'}} tickLine={false} axisLine={{stroke: 'var(--color-border-subtle)'}} />
                   <YAxis type="number" dataKey="coords.risk" stroke="var(--color-border-active)" tick={{fontSize: 9, fontFamily: 'monospace', fill: 'var(--color-text-muted)'}} tickLine={false} axisLine={{stroke: 'var(--color-border-subtle)'}} />
                   <ZAxis type="number" dataKey="count" range={[50, 400]} />
                   <Tooltip 
                      cursor={{ stroke: 'var(--color-border-active)', strokeDasharray: '3 3' }} 
                      contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} 
                      itemStyle={{ color: '#00E5FF' }}
                      labelStyle={{ color: '#8b9bb4' }}
                   />
                   <Scatter data={clusters || []} onClick={(e) => setSelectedCluster(e.payload)}>
                     {
                       (clusters || []).map((entry: any, index: number) => (
                         <Cell key={`cell-${index}`} fill={clusterColors[entry.label] || "var(--color-primary)"} fillOpacity={0.8} className="cursor-pointer hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_currentColor]" />
                       ))
                     }
                   </Scatter>
                 </ScatterChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          <div className="h-[240px] grid grid-cols-2 gap-6">
            <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex flex-col relative">
              <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-text-muted)] mb-2">Probability Distribution</h3>
              <div className="absolute top-5 right-5 text-[8px] font-mono text-[var(--color-primary)]">EXPECTED VAL: -$2.4M</div>
              <div className="flex-1 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={distributionData}>
                    <defs>
                      <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="x" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} itemStyle={{ color: '#00E5FF' }} labelStyle={{ color: '#8b9bb4' }} />
                    <Area type="monotone" dataKey="probability" stroke="var(--color-primary)" fill="url(#probGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex flex-col">
              <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-warning)] mb-2">Outcome Clusters</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar mt-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border-subtle)]">
                      <th className="pb-2 font-normal">Scenario</th>
                      <th className="pb-2 font-normal text-right">Value</th>
                      <th className="pb-2 font-normal text-right">Prob</th>
                    </tr>
                  </thead>
                  <tbody className="text-[9px] font-mono">
                    <tr className="border-b border-white/[0.02]">
                      <td className="py-2 text-[var(--color-success)] flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[var(--color-success)] rounded-full"></div> Best Case</td>
                      <td className="py-2 text-right">+$12.5M</td>
                      <td className="py-2 text-right text-gray-400">15%</td>
                    </tr>
                    <tr className="border-b border-white/[0.02]">
                      <td className="py-2 text-[var(--color-primary)] flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div> Expected Case</td>
                      <td className="py-2 text-right">-$2.4M</td>
                      <td className="py-2 text-right text-gray-400">70%</td>
                    </tr>
                    <tr className="border-b border-white/[0.02]">
                      <td className="py-2 text-[var(--color-critical)] flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[var(--color-critical)] rounded-full"></div> Worst Case</td>
                      <td className="py-2 text-right">-$18.2M</td>
                      <td className="py-2 text-right text-gray-400">15%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar (Right) */}
        <div className="col-span-4 bg-[var(--color-panel)] border border-[var(--color-border-subtle)] flex flex-col overflow-hidden relative">
          <div className="absolute top-0 right-0 px-2 py-1 bg-[var(--color-primary)]/10 border-b border-l border-[var(--color-primary)]/30 text-[8px] font-mono text-[var(--color-primary)] uppercase">
            Analysis Cortex Active
          </div>
          <div className="p-4 border-b border-[var(--color-border-subtle)] bg-white/[0.02] mt-6">
             <h3 className="text-[10px] uppercase font-mono tracking-widest text-white flex items-center gap-2">
               <Target className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Selected Future Synthesis
             </h3>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {selectedCluster ? (
                 <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                   
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <div className={`w-2 h-2 animate-pulse`} style={{ backgroundColor: clusterColors[selectedCluster.label] }}></div>
                       <h2 className="text-xl font-bold uppercase tracking-wider text-white">{selectedCluster.label}</h2>
                     </div>
                     <p className="text-[9px] text-[var(--color-text-muted)] font-mono uppercase border border-[var(--color-border-subtle)] inline-block px-1.5 py-0.5 bg-black/30 mt-2">
                       Cluster Density: {selectedCluster.count} Paths
                     </p>
                   </div>

                   <div className="grid grid-cols-2 gap-px bg-[var(--color-border-subtle)] border border-[var(--color-border-subtle)]">
                     <div className="bg-[var(--color-panel)] p-3">
                       <div className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mb-1">Expected Value</div>
                       <div className="text-lg font-mono font-bold tracking-tighter text-white">${(selectedCluster.impact / 1000000).toFixed(1)}M</div>
                     </div>
                     <div className="bg-[var(--color-panel)] p-3">
                       <div className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mb-1">Probability</div>
                       <div className="text-lg font-mono font-bold tracking-tighter" style={{color: clusterColors[selectedCluster.label]}}>
                         {(selectedCluster.count / 100).toFixed(1)}%
                       </div>
                     </div>
                     <div className="bg-[var(--color-panel)] p-3">
                       <div className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mb-1">Delay Exposure</div>
                       <div className="text-sm font-mono tracking-tighter text-white mt-1">14 Days</div>
                     </div>
                     <div className="bg-[var(--color-panel)] p-3">
                       <div className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mb-1">Model Confidence</div>
                       <div className="text-sm font-mono tracking-tighter text-[var(--color-success)] mt-1">92.4%</div>
                     </div>
                   </div>
                   
                   <div className="flex flex-col gap-3">
                     <h3 className="text-[9px] uppercase font-mono tracking-widest text-[var(--color-text-muted)] flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2">
                       <Binary className="w-3 h-3" /> Recommended Actions
                     </h3>
                     <div className="flex flex-col gap-2">
                       {selectedCluster.actions?.map((act: string, idx: number) => (
                         <div key={idx} className="bg-white/[0.01] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)]/50 p-2.5 rounded-sm text-[10px] font-mono flex items-start gap-3 transition-colors group cursor-pointer">
                           <span className="text-[var(--color-primary)] group-hover:animate-pulse">&gt;</span>
                           <span className="text-gray-300 group-hover:text-white transition-colors">{act}</span>
                         </div>
                       ))}
                       {(!selectedCluster.actions || selectedCluster.actions.length === 0) && (
                         <div className="text-[10px] font-mono text-[var(--color-text-muted)] italic p-3 border border-dashed border-[var(--color-border-subtle)]">
                           No deterministic actions resolved.
                         </div>
                       )}
                     </div>
                   </div>
                 </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] h-full min-h-[300px] opacity-30">
                   <HelpCircle className="w-10 h-10 mb-4 opacity-50 text-[var(--color-primary)]" />
                   <p className="text-[9px] font-mono uppercase tracking-widest text-center">Select an outcome cluster<br/>to extract dimensions</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
