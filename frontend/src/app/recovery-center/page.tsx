"use client"

import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/lib/api'
import { ServerCog, Play, CheckCircle, Clock, ShieldAlert, Lock, TerminalSquare, Cpu, Activity, Network } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function RecoveryCenter() {
  const { data, refetch } = useQuery({
    queryKey: ['execution-status'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/execution/status`)
      return res.json()
    },
    refetchInterval: 3000
  })

  const generatePlan = async () => {
    await fetch(`${API_URL}/api/execution/plan?scenario_id=1&recovery_path_id=1`, { method: 'POST' })
    refetch()
  }

  const approveAction = async (id: string) => {
    toast.loading(`Approving action ${id}...`, { id: 'approval' });
    try {
      await fetch(`${API_URL}/api/execution/approve/${id}`, { method: 'POST' })
      toast.success(`Action ${id} approved`, { id: 'approval' });
      refetch()
    } catch (e) {
      toast.error('Approval failed', { id: 'approval' });
    }
  }

  const rejectAction = async (id: string) => {
    toast.loading(`Rejecting action ${id}...`, { id: 'rejection' });
    try {
      await fetch(`${API_URL}/api/execution/reject/${id}`, { method: 'POST' })
      toast.success(`Action ${id} rejected`, { id: 'rejection' });
      refetch()
    } catch (e) {
      toast.error('Rejection failed', { id: 'rejection' });
    }
  }

  const getIconForConnector = (type: string) => {
    if (type === 'UiPath') return TerminalSquare
    if (type === 'ServiceNow') return ServerCog
    if (type === 'Slack') return Activity
    if (type === 'SAP') return Cpu
    return Network
  }

  const actions = data?.actions || []
  const hasActions = actions.length > 0

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[var(--color-background)] p-6 overflow-hidden">
      
      {/* Header Meta Strip */}
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-2 mb-6">
        <div>
           <h1 className="text-2xl font-black tracking-widest text-white uppercase flex items-center gap-2">
             <ServerCog className="w-5 h-5 text-[var(--color-primary)]" />
             Autonomous Recovery Center
           </h1>
           <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest mt-1">Execution & Orchestration Engine // DAG Processing</p>
        </div>
        <div className="flex gap-4">
          <button onClick={generatePlan} className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-sm text-[10px] tracking-widest font-bold flex items-center gap-2 hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 transition-colors uppercase">
            <Play className="w-3 h-3" /> Initialize Execution Plan
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        
        {/* Execution DAG Timeline */}
        <div className="col-span-8 bg-[var(--color-panel)] p-6 border border-[var(--color-border-subtle)] relative flex flex-col overflow-hidden h-full">
          <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-6 flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-4">
            <Network className="w-4 h-4 text-[var(--color-primary)]" /> Orchestration Directed Acyclic Graph (DAG)
          </h3>
          
          <div className="flex-1 w-full relative flex items-center justify-center px-10">
             
             {hasActions ? (
               <div className="w-full flex justify-between relative z-10">
                 {/* Animated SVG Connector Line */}
                 <svg className="absolute top-1/2 left-0 right-0 w-full h-2 -translate-y-1/2 z-0 pointer-events-none">
                    <line x1="0" y1="4" x2="100%" y2="4" stroke="var(--color-border-subtle)" strokeWidth="2" />
                    <motion.line 
                      initial={{ strokeDashoffset: 100 }} 
                      animate={{ strokeDashoffset: 0 }} 
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      x1="0" y1="4" x2="100%" y2="4" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="10 10" 
                    />
                 </svg>

                 {actions.map((node: any, i: number) => {
                   const Icon = getIconForConnector(node.connector_type)
                   const isCompleted = node.status === 'COMPLETED'
                   const isPending = node.status === 'IN_PROGRESS' || (node.status === 'PENDING' && i === 0)
                   
                   return (
                     <div key={node.id} className="flex flex-col items-center relative group cursor-pointer z-10">
                       
                       {/* Status Indicator Above */}
                       <div className="absolute -top-10 text-[8px] uppercase tracking-widest font-bold whitespace-nowrap">
                          {isCompleted ? <span className="text-[var(--color-success)]">Success</span> : 
                           isPending ? <span className="text-[var(--color-warning)]">Active</span> : 
                           <span className="text-[var(--color-text-muted)]">Awaiting</span>}
                       </div>

                       {/* Node Circle */}
                       <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-black transition-colors relative
                         ${isCompleted ? 'border-[var(--color-success)] text-[var(--color-success)] shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-[var(--color-success)]/10' : 
                           isPending ? 'border-[var(--color-warning)] text-[var(--color-warning)] shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-[var(--color-warning)]/10' : 
                           'border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-black/50'}`}>
                         <Icon className="w-5 h-5" />
                         
                         {/* Inner progress ring mock for pending */}
                         {isPending && (
                           <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                             <circle cx="22" cy="22" r="22" fill="none" stroke="var(--color-warning)" strokeWidth="1.5" strokeDasharray="138" strokeDashoffset="70" className="animate-[spin_3s_linear_infinite]" />
                           </svg>
                         )}
                       </div>
                       
                       {/* Node Text */}
                       <div className="mt-4 text-center">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-white mb-1 whitespace-nowrap">{node.action_type}</div>
                          <div className="text-[8px] text-[var(--color-primary)] font-mono whitespace-nowrap uppercase tracking-widest">{node.connector_type}</div>
                       </div>
                     </div>
                   )
                 })}
               </div>
             ) : (
               <div className="text-[10px] font-mono text-[var(--color-text-muted)] italic">Awaiting plan initialization...</div>
             )}
          </div>

          <div className="mt-auto border-t border-[var(--color-border-subtle)] pt-4 flex justify-between items-center text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] font-mono">
            <span>Execution Plan: {data?.plan?.id || '---'}</span>
            <span className="text-[var(--color-primary)] flex items-center gap-2"><Activity className="w-3 h-3 animate-pulse" /> Telemetry Active</span>
          </div>
        </div>

        {/* Human Approval Queue */}
        <div className="col-span-4 bg-[var(--color-panel)] p-5 border border-[var(--color-warning)]/30 shadow-[0_0_30px_rgba(245,158,11,0.05)] flex flex-col h-full overflow-hidden">
           <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-warning)] mb-4 flex items-center gap-2 border-b border-[var(--color-warning)]/20 pb-3">
             <ShieldAlert className="w-4 h-4" /> Human Validation Queue
           </h3>
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
             <AnimatePresence mode="popLayout">
               {data?.pending_approvals?.map((req: any) => (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={req.id} className="bg-black/40 border border-[var(--color-warning)]/30 p-4 rounded-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-warning)]"></div>
                   <div className="text-[9px] text-[var(--color-warning)] uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                     <Lock className="w-3 h-3" /> Requires Authorization
                   </div>
                   <div className="text-[10px] text-gray-300 mb-4 leading-relaxed font-mono">
                     Executive override required to proceed with {req.action_type || 'automation workflow'} [ID: {req.id}].
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => approveAction(req.id)} className="flex-1 bg-[var(--color-warning)]/10 hover:bg-[var(--color-warning)]/20 text-[var(--color-warning)] border border-[var(--color-warning)]/50 font-bold uppercase tracking-widest text-[9px] py-2 rounded-sm transition-colors flex justify-center items-center gap-1">
                       <CheckCircle className="w-3 h-3" /> Approve
                     </button>
                     <button onClick={() => rejectAction(req.id)} className="flex-1 bg-transparent hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 border border-[var(--color-border-subtle)] hover:border-red-500/50 font-bold uppercase tracking-widest text-[9px] py-2 rounded-sm transition-colors">
                       Reject
                     </button>
                   </div>
                 </motion.div>
               ))}
               {(!data?.pending_approvals || data.pending_approvals.length === 0) && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-gray-500">
                    <CheckCircle className="w-8 h-8 mb-3 opacity-30 text-[var(--color-success)]" />
                    <div className="text-[10px] uppercase font-mono tracking-widest">Queue Empty</div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
           
           <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-4">
             <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-mono">Active Integrations</div>
             <div className="grid grid-cols-2 gap-2">
               {["UiPath Orchestrator", "ServiceNow ITSM", "Slack Enterprise", "SAP ERP"].map(p => (
                 <div key={p} className="bg-black/30 border border-[var(--color-border-subtle)] px-2 py-1.5 rounded-sm text-[9px] font-mono text-gray-400 flex items-center justify-between">
                   <span className="truncate">{p}</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] shadow-[0_0_5px_var(--color-success)]"></div>
                 </div>
               ))}
             </div>
           </div>
        </div>

      </div>
    </div>
  )
}
