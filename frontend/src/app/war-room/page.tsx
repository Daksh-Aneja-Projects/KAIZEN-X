"use client"

import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/lib/api'
import { Cpu, Share2, Activity, ShieldAlert, Zap, Network, Bot, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WarRoom() {
  const { data, refetch } = useQuery({
    queryKey: ['war-room'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/agents/war-room`)
      return res.json()
    },
    refetchInterval: 2000
  })

  const runAnalysis = async () => {
    await fetch(`${API_URL}/api/agents/analyze`, { method: 'POST' })
    refetch()
  }

  const swarmAgents = [
    { name: "Risk Agent", color: "var(--color-critical)", icon: ShieldAlert },
    { name: "Finance Agent", color: "var(--color-warning)", icon: Activity },
    { name: "Ops Agent", color: "var(--color-primary)", icon: Network },
    { name: "Strategy Agent", color: "var(--color-success)", icon: Zap },
    { name: "Executive Agent", color: "#fff", icon: Bot, isExec: true }
  ]

  const getInteractions = (agentName: string) => {
    if (!data?.interactions) return []
    return data.interactions.filter((i: any) => i.agent_name === agentName)
  }

  const getRecommendation = (agentName: string) => {
    if (!data?.recommendations) return null
    return data.recommendations.find((r: any) => r.agent_name === agentName)
  }

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[var(--color-background)] p-6 overflow-hidden">
      
      {/* Header Meta Strip */}
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-2 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white uppercase flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[var(--color-primary)]" />
            Agent War Room
          </h1>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mt-1">Multi-Agent Swarm Intelligence // Local Inference Mode</p>
        </div>
        <div className="flex gap-4">
          <button onClick={runAnalysis} className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-sm text-[10px] font-mono font-bold tracking-widest flex items-center gap-2 border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/20 transition-colors uppercase">
            <Cpu className="w-3 h-3" /> Trigger Swarm Inference
          </button>
        </div>
      </div>

      {/* 5-Panel Swarm Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-5 gap-4">
        {swarmAgents.map((agent, i) => {
          const interactions = getInteractions(agent.name)
          const recommendation = getRecommendation(agent.name)
          
          return (
            <div key={i} className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] flex flex-col relative overflow-hidden group">
               {/* Panel Header */}
               <div className="p-4 border-b border-[var(--color-border-subtle)] relative z-10 bg-black/40">
                 <div className="flex justify-between items-center mb-3">
                   <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: agent.color }}>
                     <agent.icon className="w-3.5 h-3.5" /> {agent.name}
                   </h2>
                   <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: agent.color }}></div>
                 </div>
                 
                 {/* Telemetry */}
                 <div className="grid grid-cols-2 gap-2 text-[8px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                   <div className="border border-[var(--color-border-subtle)] bg-white/[0.01] p-1.5 flex justify-between">
                     <span>Tokens</span>
                     <span className="text-white">{interactions[0]?.reasoning?.tokens_used || '---'}</span>
                   </div>
                   <div className="border border-[var(--color-border-subtle)] bg-white/[0.01] p-1.5 flex justify-between">
                     <span>Latency</span>
                     <span className="text-white">{interactions[0]?.reasoning?.inference_time_ms ? `${interactions[0].reasoning.inference_time_ms}ms` : '---'}</span>
                   </div>
                 </div>
               </div>
               
               {/* Streaming Output */}
               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative z-10 opacity-90 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:20px_20px]">
                 <AnimatePresence>
                   {interactions.map((interaction: any) => (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={interaction.id} className="mb-4">
                        <div className="flex items-start gap-2 text-[10px] font-mono leading-relaxed text-gray-300">
                           <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" style={{ color: agent.color }} />
                           <div className="break-words border-l border-white/5 pl-2">{interaction.reasoning?.output || interaction.prompt || interaction.message}</div>
                        </div>
                     </motion.div>
                   ))}
                   {interactions.length === 0 && (
                     <div className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest italic mt-4 flex justify-center">
                        Awaiting prompt...
                     </div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Agent Recommendation */}
               <div className="p-4 border-t border-[var(--color-border-subtle)] bg-black/60 relative z-10">
                 <h3 className="text-[8px] uppercase font-mono tracking-widest text-[var(--color-text-muted)] mb-2">Final Recommendation</h3>
                 {recommendation ? (
                   <div className="text-[9px] font-mono text-white p-2 border border-white/10" style={{ borderLeftColor: agent.color, borderLeftWidth: '2px' }}>
                     {recommendation.recommendation}
                     <div className="mt-2 text-[8px] text-[var(--color-text-muted)]">Confidence: {recommendation.confidence * 100}%</div>
                   </div>
                 ) : (
                   <div className="text-[9px] font-mono text-gray-600 italic">Processing...</div>
                 )}
               </div>
               
               {/* Decorative Glow */}
               <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-5 blur-3xl pointer-events-none" style={{ backgroundColor: agent.color }}></div>
            </div>
          )
        })}
      </div>
      
      {/* Executive Consensus Strip */}
      <div className="mt-4 bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded border border-[var(--color-success)] flex items-center justify-center bg-[var(--color-success)]/10 text-[var(--color-success)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-text-muted)]">Swarm Consensus Reached</h3>
            <p className="text-sm font-bold text-white uppercase tracking-wider">{data?.consensus?.final_decision || "AWAITING SWARM CONVERGENCE"}</p>
          </div>
        </div>
        
        {data?.consensus && (
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <div className="text-[8px] uppercase font-mono tracking-widest text-[var(--color-text-muted)]">Readiness Score</div>
              <div className="text-lg font-mono font-bold text-[var(--color-success)]">{data.consensus.readiness_score}%</div>
            </div>
            <div className="w-px h-8 bg-[var(--color-border-subtle)]"></div>
            <div className="text-right max-w-[300px]">
               <div className="text-[8px] uppercase font-mono tracking-widest text-[var(--color-text-muted)]">Executive Rationale</div>
               <div className="text-[9px] font-mono text-gray-300 truncate">{data.consensus.rationale}</div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
