"use client"

import { useQuery } from '@tanstack/react-query'
import { fetchFuturesOutcomes } from '@/lib/api'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Beaker, FlaskConical, TestTube2, AlertCircle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'

export default function OutcomeExplorer() {
  const { data: clusters } = useQuery({
    queryKey: ['outcomes'],
    queryFn: fetchFuturesOutcomes,
    refetchInterval: 5000
  })

  const clusterColors: any = {
    "Winning Futures": "var(--color-success)",
    "Acceptable Futures": "var(--color-primary)",
    "Failing Futures": "var(--color-warning)",
    "Catastrophic Futures": "var(--color-critical)"
  }
  
  const getIcon = (label: string) => {
    if (label.includes("Winning")) return ArrowUpRight
    if (label.includes("Acceptable")) return Activity
    if (label.includes("Failing")) return ArrowDownRight
    return AlertCircle
  }

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[var(--color-background)] p-6 overflow-hidden">
      
      {/* Header Meta Strip */}
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-2 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white uppercase flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[var(--color-primary)]" />
            Outcome Explorer
          </h1>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mt-1">Quantitative Scenario Research // Distribution Clusters</p>
        </div>
      </div>

      {/* 4 Cards (Dynamically generated from clusters) */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {(clusters || []).map((cluster: any, i: number) => {
          const Icon = getIcon(cluster.label)
          const color = clusterColors[cluster.label] || "var(--color-primary)"
          
          return (
            <div key={i} className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-6 flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-[10px] uppercase font-mono tracking-widest" style={{ color }}>{cluster.label}</h3>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex items-end gap-3 mb-2 relative z-10">
                <span className="text-3xl font-mono text-white font-bold tracking-tighter">{cluster.count}</span>
                <span className="text-[9px] text-[var(--color-text-muted)] font-mono mb-1.5 uppercase tracking-widest">Trajectories</span>
              </div>
              <div className="text-sm font-mono font-bold text-gray-300 mb-2 relative z-10">${(cluster.impact / 1000000).toFixed(1)}M Expected</div>
              
              {/* Background Glow */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 blur-2xl transition-opacity group-hover:opacity-10" style={{ backgroundColor: color }}></div>
              <div className="absolute inset-0 bg-[url('/bg-grid.png')] opacity-[0.03] pointer-events-none"></div>
            </div>
          )
        })}
        {(!clusters || clusters.length === 0) && (
          <div className="col-span-4 bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-6 flex items-center justify-center text-[10px] font-mono text-[var(--color-text-muted)]">
            Awaiting deterministic cluster distributions...
          </div>
        )}
      </div>

      {/* Main Analysis Area */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        
        <div className="col-span-8 bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex flex-col relative overflow-hidden group">
           <div className="flex justify-between items-start mb-4 relative z-10">
             <div>
               <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-primary)] flex items-center gap-2">
                 <TestTube2 className="w-3.5 h-3.5" /> Trajectory Distribution Analysis
               </h3>
               <p className="text-[9px] text-[var(--color-text-muted)] font-mono mt-1">Multi-dimensional space plotting</p>
             </div>
             <div className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest border border-[var(--color-border-subtle)] px-2 py-1 bg-black/50">
                X: Cost • Y: Probability • Z: Density
             </div>
           </div>
           
           <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--color-primary)] opacity-50"></div>
           <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--color-primary)] opacity-50"></div>
           <div className="absolute inset-0 bg-[url('/bg-grid.png')] opacity-[0.03] pointer-events-none"></div>

           <div className="flex-1 w-full relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                 <XAxis type="number" dataKey="coords.cost" stroke="var(--color-border-active)" tick={{fontSize: 9, fontFamily: 'monospace', fill: 'var(--color-text-muted)'}} tickLine={false} axisLine={{stroke: 'var(--color-border-subtle)'}} />
                 <YAxis type="number" dataKey="coords.risk" stroke="var(--color-border-active)" tick={{fontSize: 9, fontFamily: 'monospace', fill: 'var(--color-text-muted)'}} tickLine={false} axisLine={{stroke: 'var(--color-border-subtle)'}} />
                 <ZAxis type="number" dataKey="count" range={[100, 1500]} />
                 <Tooltip cursor={{ stroke: 'var(--color-border-active)', strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-border-subtle)', borderRadius: '2px', fontSize: '10px', fontFamily: 'monospace' }} />
                 <Scatter data={clusters || []}>
                   {
                     (clusters || []).map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={clusterColors[entry.label] || "var(--color-primary)"} fillOpacity={0.7} className="cursor-pointer hover:opacity-100 transition-opacity" />
                     ))
                   }
                 </Scatter>
               </ScatterChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="col-span-4 bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex flex-col relative overflow-hidden">
          <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-warning)] mb-4 flex items-center gap-2">
            <Beaker className="w-3.5 h-3.5" /> Cluster Taxonomy
          </h3>
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            {(clusters || []).map((cluster: any, idx: number) => (
              <div key={idx} className="bg-black/30 border border-[var(--color-border-subtle)] p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: clusterColors[cluster.label] || "var(--color-primary)" }}></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">{cluster.label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)]">{cluster.count} Paths</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-[var(--color-text-muted)] uppercase tracking-widest text-[8px]">Avg Impact</span>
                  <span className="text-white">${(cluster.impact / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
