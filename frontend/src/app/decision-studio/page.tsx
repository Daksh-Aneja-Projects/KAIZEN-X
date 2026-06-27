"use client"

import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/lib/api'
import { LayoutDashboard, Target, Zap, Clock, TrendingUp, Cpu, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { useState } from 'react'

export default function DecisionStudio() {
  const [isExecuting, setIsExecuting] = useState(false)
  
  const { data } = useQuery({
    queryKey: ['decision-studio'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/agents/decision-studio`)
      return res.json()
    }
  })

  const handleExecute = async () => {
    setIsExecuting(true)
    await fetch(`${API_URL}/api/execution/approve/1`, { method: 'POST' })
    setIsExecuting(false)
  }

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[var(--color-background)] p-6 overflow-hidden">
      
      {/* Header Meta Strip */}
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-2 mb-6">
        <div>
           <h1 className="text-2xl font-black tracking-widest text-white uppercase flex items-center gap-2">
             <LayoutDashboard className="w-5 h-5 text-[var(--color-success)]" />
             Decision Studio
           </h1>
           <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mt-1">Executive Directive Synthesis // Recovery Paths Matrix</p>
        </div>
        <div className="flex gap-4">
          <button disabled={isExecuting} onClick={handleExecute} className={`bg-[var(--color-success)] text-black px-4 py-2 rounded-sm text-[10px] tracking-widest font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] uppercase ${isExecuting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-success)]/90'}`}>
            <Zap className={`w-3 h-3 ${isExecuting ? 'animate-pulse' : ''}`} /> {isExecuting ? 'Executing...' : 'Execute Selected Path'}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        
        {/* Left: Readiness & Executive Summary */}
        <div className="col-span-4 flex flex-col gap-6 h-full">
           <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-success)] to-transparent opacity-50"></div>
             <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-[var(--color-success)]" /> Platform Readiness Index
             </h3>
             <div className="relative mb-6">
               <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-success)] to-[#047857] tracking-tighter">
                 {Math.round((data?.readiness_metrics?.execution_readiness_score || 0.92) * 100)}
               </div>
               <span className="absolute top-2 -right-6 text-[var(--color-success)] font-bold text-xl">%</span>
             </div>
             
             <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-6 border-t border-[var(--color-border-subtle)]">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest">Consensus</span>
                  <span className="text-xs font-mono text-white mt-1">98%</span>
                </div>
                <div className="flex flex-col items-center border-x border-[var(--color-border-subtle)]">
                  <span className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest">Confidence</span>
                  <span className="text-xs font-mono text-[var(--color-primary)] mt-1">High</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest">Complexity</span>
                  <span className="text-xs font-mono text-[var(--color-warning)] mt-1">Low</span>
                </div>
             </div>
           </div>

           <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex-1 flex flex-col relative overflow-hidden">
             <h3 className="text-[10px] uppercase tracking-widest text-white border-b border-[var(--color-border-subtle)] pb-2 flex items-center gap-2 mb-4">
                <Target className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Final Directives
             </h3>
             <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                {data?.executive_recommendations?.map((rec: any, idx: number) => (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={rec.id || idx} className="bg-black/30 border border-[var(--color-border-subtle)] p-4 group hover:border-[var(--color-success)]/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-[9px] uppercase tracking-widest text-[var(--color-success)] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {rec.agent_name}
                      </div>
                      <div className="text-[8px] bg-[var(--color-success)]/10 text-[var(--color-success)] px-1.5 py-0.5 rounded-sm font-mono">Conf: {Math.round((rec.confidence || 0.9) * 100)}%</div>
                    </div>
                    <div className="text-[10px] text-gray-300 mb-3 font-mono leading-relaxed border-l-2 border-[var(--color-success)] pl-2">{rec.recommendation}</div>
                    <div className="flex gap-4 text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> ROI: {Math.round((rec.expected_benefit || 1.2) * 100)}%</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Comp: {Math.round((rec.complexity || 0.3) * 100)}%</span>
                    </div>
                  </motion.div>
                ))}
                {(!data?.executive_recommendations || data.executive_recommendations.length === 0) && (
                   <div className="text-[9px] text-[var(--color-text-muted)] italic font-mono p-4">Awaiting execution directives...</div>
                )}
             </div>
           </div>
        </div>

        {/* Right: Recovery Matrix */}
        <div className="col-span-8 bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex flex-col relative overflow-hidden h-full">
          <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-3 mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-white flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[var(--color-warning)]" /> Decision Matrix & Path Evaluation
            </h3>
            <div className="text-[8px] font-mono uppercase tracking-widest bg-black/50 border border-[var(--color-border-subtle)] px-2 py-1 text-[var(--color-text-muted)]">
               Multi-Variable Trajectory
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
             {/* Dense Matrix Header */}
             <div className="grid grid-cols-12 gap-2 text-[8px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] pb-2 px-4">
                <div className="col-span-1">ID</div>
                <div className="col-span-4">Execution Path Steps</div>
                <div className="col-span-2 text-right">Probability</div>
                <div className="col-span-2 text-right">Duration</div>
                <div className="col-span-2 text-right">Risk</div>
                <div className="col-span-1 text-right">Action</div>
             </div>

             {data?.recovery_paths?.map((path: any, index: number) => (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.15 }} key={path.id} className="grid grid-cols-12 gap-2 bg-black/40 border border-[var(--color-border-subtle)] p-4 items-center group hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer relative overflow-hidden">
                  
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-[var(--color-success)] text-black text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-bl-sm z-10">
                      Optimal
                    </div>
                  )}

                  <div className="col-span-1 text-[9px] font-mono text-[var(--color-text-muted)]">P-0{index + 1}</div>
                  
                  <div className="col-span-4 flex flex-col gap-1">
                    <ul className="list-none space-y-1">
                      {path.steps.slice(0,3).map((s:any, i:number) => (
                         <li key={i} className="text-[9px] font-mono text-gray-300 flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-[var(--color-primary)] opacity-50"></div>
                           <span className="truncate">{s.step}</span>
                         </li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-span-2 flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono text-[var(--color-success)] font-bold">{Math.round((path.success_probability || 0.9) * 100)}%</span>
                    <div className="w-16 bg-[var(--color-border-subtle)] h-1 rounded overflow-hidden">
                      <div className="bg-[var(--color-success)] h-full" style={{ width: `${(path.success_probability || 0.9) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="col-span-2 text-right text-[10px] font-mono text-white">
                    {path.estimated_duration_days || 2} Days
                  </div>

                  <div className="col-span-2 text-right text-[10px] font-mono text-[var(--color-warning)]">
                    Moderate
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button className="w-6 h-6 border border-[var(--color-border-subtle)] flex items-center justify-center group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)] transition-colors rounded-sm text-[var(--color-text-muted)]">
                      <Cpu className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Subtle Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
               </motion.div>
             ))}
             {(!data?.recovery_paths || data.recovery_paths.length === 0) && (
               <div className="flex items-center justify-center h-40 text-[10px] font-mono text-[var(--color-text-muted)] italic">
                 Awaiting path permutations...
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  )
}
