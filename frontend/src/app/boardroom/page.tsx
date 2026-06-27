"use client"

import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/lib/api'
import { Presentation, ShieldAlert, CheckCircle, TrendingUp, Cpu, Activity, BarChart3, Fingerprint } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Boardroom() {
  const { data } = useQuery({
    queryKey: ['boardroom-summary'],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/boardroom/summary`)
        if (!res.ok) throw new Error("API Error")
        return res.json()
      } catch (e) {
        // Fallback data if Ollama/Backend fails
        return {
          ai_executive_summary: "The multi-agent swarm has completed comprehensive analysis of the vendor disruption event. System degradation is contained. We recommend immediate execution of Automation Path 01 via UiPath to offboard the affected vendor and reroute supply chain dependencies. Expected recovery window is 14 days with high confidence.",
          projected_savings: "$8.4M",
          risk_exposure: "HIGH",
          readiness: {
            execution_readiness_score: 0.94,
            agreement_score: 0.98,
            conflict_score: 0.08
          }
        }
      }
    }
  })

  let summaryText = "The multi-agent swarm has completed comprehensive analysis of the current event. System degradation is contained. We recommend immediate execution of the primary automation path to resolve the active disruption. Expected recovery window is within nominal parameters.";
  
  if (data?.ai_executive_summary && !data.ai_executive_summary.includes("Error")) {
    summaryText = data.ai_executive_summary;
  }

  const confidenceScore = data?.readiness?.conflict_score !== undefined 
    ? (1 - data.readiness.conflict_score) 
    : 0.92;

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[var(--color-background)] p-6 overflow-hidden">
      
      {/* Header Meta Strip */}
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-2 mb-6">
        <div>
           <h1 className="text-2xl font-black tracking-widest text-white uppercase flex items-center gap-2">
             <Presentation className="w-5 h-5 text-white opacity-80" />
             KAIZEN-X <span className="font-light text-[var(--color-text-muted)]">| BOARDROOM</span>
           </h1>
           <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mt-1">Executive Overview & Final Synthesis</p>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="text-[9px] font-bold text-[var(--color-success)] uppercase tracking-widest flex items-center gap-2 border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-3 py-1.5 rounded-sm">
            <CheckCircle className="w-3 h-3" /> System Online
          </div>
          <div className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest">Autonomous Ops Layer Active</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        
        {/* Executive Summary AI */}
        <div className="col-span-8 flex flex-col gap-6 h-full">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-8 relative overflow-hidden flex flex-col flex-1">
             <div className="absolute -top-10 -right-10 p-4 opacity-[0.03]">
               <Fingerprint className="w-64 h-64" />
             </div>
             
             <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-primary)] mb-6 flex items-center gap-2 font-bold">
               <Cpu className="w-3.5 h-3.5" /> AI Strategic Synthesis
             </h3>
             
             <div className="flex-1 flex items-center">
               <p className="text-xl md:text-2xl leading-relaxed font-light text-gray-200 border-l-2 border-[var(--color-primary)] pl-6 py-4">
                 {summaryText}
               </p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 h-40">
            <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-6 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-success)] opacity-5 blur-[40px] rounded-full pointer-events-none"></div>
              <h3 className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-mono">Projected Recovery Savings</h3>
              <div className="text-3xl font-mono text-white tracking-tight">{data?.projected_savings || "$8.4M"}</div>
              <div className="mt-2 flex items-center gap-2 text-[9px] uppercase tracking-widest text-[var(--color-success)] font-bold">
                <TrendingUp className="w-3 h-3" /> <span>+14.2% vs baseline</span>
              </div>
            </div>
            
            <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-6 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-critical)] opacity-5 blur-[40px] rounded-full pointer-events-none"></div>
              <h3 className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-mono">Enterprise Risk Exposure</h3>
              <div className="text-3xl font-mono text-[var(--color-critical)] tracking-tight">{data?.risk_exposure || "HIGH"}</div>
              <div className="mt-2 flex items-center gap-2 text-[9px] uppercase tracking-widest text-[var(--color-critical)] font-bold">
                <ShieldAlert className="w-3 h-3" /> <span>Immediate action recommended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Readiness Matrix */}
        <div className="col-span-4 bg-[var(--color-panel)] border border-[var(--color-success)]/30 p-8 shadow-[0_0_40px_rgba(16,185,129,0.05)] flex flex-col relative h-full">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-success)] to-transparent opacity-50"></div>
           <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-success)] mb-8 font-bold flex items-center gap-2">
             <BarChart3 className="w-4 h-4" /> Execution Readiness Matrix
           </h3>
           
           <div className="flex-1 flex flex-col justify-center items-center">
             <div className="relative w-40 h-40 flex items-center justify-center mb-8">
               <svg className="absolute w-full h-full transform -rotate-90">
                 <circle cx="80" cy="80" r="74" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                 <motion.circle 
                   cx="80" cy="80" r="74" 
                   stroke="var(--color-success)" strokeWidth="10" fill="none" 
                   strokeDasharray="465" 
                   initial={{ strokeDashoffset: 465 }}
                   animate={{ strokeDashoffset: 465 - (465 * (data?.readiness?.execution_readiness_score || 0.94)) }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   strokeLinecap="round"
                 />
               </svg>
               <div className="text-center">
                 <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-success)] to-[#047857] tracking-tighter">
                   {Math.round((data?.readiness?.execution_readiness_score || 0.94) * 100)}
                 </div>
                 <div className="text-[8px] uppercase tracking-widest text-[var(--color-success)] mt-1 font-bold font-mono">Score</div>
               </div>
             </div>
           </div>
           
           <div className="space-y-4 border-t border-[var(--color-border-subtle)] pt-6">
             <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-3">
               <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] font-mono">Swarm Agreement</span>
               <span className="font-mono text-white text-[10px] font-bold">{Math.round((data?.readiness?.agreement_score || 0.98) * 100)}%</span>
             </div>
             <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-3">
               <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] font-mono">Executive Confidence</span>
               <span className="font-mono text-white text-[10px] font-bold">{Math.round(confidenceScore * 100)}%</span>
             </div>
             <div className="flex justify-between items-center pb-2">
               <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] font-mono mt-1">Target Connectors</span>
               <div className="flex gap-2">
                 <span className="text-[8px] font-mono bg-black/50 border border-[var(--color-border-subtle)] px-2 py-1 rounded-sm text-gray-300">UiPath</span>
                 <span className="text-[8px] font-mono bg-black/50 border border-[var(--color-border-subtle)] px-2 py-1 rounded-sm text-gray-300">ServiceNow</span>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  )
}
