"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api'

export default function DemoHero() {
  const router = useRouter()
  const [stage, setStage] = useState(0)

  // Master Demo Orchestrator Sequence
  useEffect(() => {
    if (stage === 1) {
      // Step 1: Trigger Backend Scenario
      fetch(`${API_URL}/api/scenarios/supply-chain-disruption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: "vendor_bankruptcy.json" })
      }).catch(err => console.error("Scenario trigger failed:", err))
      
      const t1 = setTimeout(() => {
        router.push('/twin')
      }, 2000)
      
      return () => { clearTimeout(t1) }
    }
  }, [stage, router])

  return (
    <div className="h-full bg-[#030712] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Grids & Orbs */}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00E5FF] rounded-full opacity-[0.02] blur-[150px] pointer-events-none"></div>
      
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center z-10">
             <Fingerprint className="w-24 h-24 text-[#00E5FF] mb-8 opacity-80 animate-pulse" />
             <h1 className="text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00E5FF] to-white mb-4 text-center">
               KAIZEN-X
             </h1>
             <p className="text-[10px] text-gray-400 uppercase tracking-[0.5em] mb-12">Enterprise Operating System V1.0</p>
             
             <button 
               onClick={() => setStage(1)}
               className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-sm"
             >
               <div className="absolute inset-0 border border-[#00E5FF]/30 group-hover:border-[#00E5FF] transition-colors duration-500"></div>
               <div className="absolute inset-0 bg-[#00E5FF] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
               <span className="relative z-10 text-[10px] uppercase tracking-[0.3em] text-[#00E5FF] group-hover:text-black font-bold flex items-center gap-3 transition-colors duration-500">
                 <Zap className="w-4 h-4" /> START ENTERPRISE FAILURE
               </span>
             </button>
          </motion.div>
        )}

        {stage > 0 && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center z-10 w-full max-w-2xl px-8">
             <div className="mt-16 text-xs uppercase tracking-[0.3em] text-[#00E5FF] animate-pulse">
               Initiating Scenario Engine... Resetting Enterprise State...
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
