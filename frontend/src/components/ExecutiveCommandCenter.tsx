"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, ShieldAlert, DollarSign, TrendingUp, Clock, Zap, Target, Binary, ServerCrash } from 'lucide-react'
import { useAppStore, AppEvent } from '@/lib/store'
import { 
  fetchOverview, fetchLiveEvents, fetchHealthHistory, fetchRadarData, 
  fetchExecutiveSummary, fetchSystemStatus, fetchFuturesOutcomes, WS_URL 
} from '@/lib/api'

export default function ExecutiveCommandCenter() {
  const { events, addEvent, setInitialEvents } = useAppStore()

  // Queries
  const { data: overview } = useQuery({ queryKey: ['overview'], queryFn: fetchOverview, refetchInterval: 5000 })
  const { data: healthData } = useQuery({ queryKey: ['healthHistory'], queryFn: fetchHealthHistory, refetchInterval: 10000 })
  const { data: radarData } = useQuery({ queryKey: ['radarData'], queryFn: fetchRadarData, refetchInterval: 10000 })
  const { data: execSummary } = useQuery({ queryKey: ['execSummary'], queryFn: fetchExecutiveSummary, refetchInterval: 10000 })
  const { data: systemStatus } = useQuery({ queryKey: ['systemStatus'], queryFn: fetchSystemStatus, refetchInterval: 10000 })
  const { data: outcomes } = useQuery({ queryKey: ['outcomes'], queryFn: fetchFuturesOutcomes, refetchInterval: 10000 })

  // Setup WS
  useEffect(() => {
    fetchLiveEvents().then(data => setInitialEvents(data || []))
    
    const ws = new WebSocket(WS_URL)
    ws.onmessage = (event) => {
      try {
        const newEvent: AppEvent = JSON.parse(event.data)
        addEvent(newEvent)
      } catch (e) {
        console.error(e)
      }
    }
    return () => ws.close()
  }, [addEvent, setInitialEvents])

  return (
    <div className="p-6 flex flex-col gap-6 h-full font-sans">
      
      {/* Top Meta Strip */}
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white uppercase">Mission Control</h1>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest">Enterprise Operating System // Overview</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[9px] uppercase font-mono text-[var(--color-text-muted)] tracking-wider">System State</div>
            <div className="text-xs font-bold text-[var(--color-primary)] uppercase">{overview?.status || 'INITIALIZING'}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase font-mono text-[var(--color-text-muted)] tracking-wider">Active Events</div>
            <div className="text-xs font-bold text-[var(--color-critical)]">{overview?.metrics?.risk_exposure || 0} TRIPPED</div>
          </div>
        </div>
      </div>

      {/* KPI Dense Grid */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Sys Health", value: (overview?.metrics?.health_score || 96) + "%", icon: Activity, color: "var(--color-primary)" },
          { label: "Risk Delta", value: overview?.metrics?.risk_exposure || "0", icon: AlertTriangle, color: "var(--color-warning)" },
          { label: "Crit Faults", value: overview?.metrics?.critical_risks || "0", icon: ServerCrash, color: "var(--color-critical)" },
          { label: "Cap At Risk", value: `$${overview?.metrics?.projected_savings || 0}M`, icon: DollarSign, color: "var(--color-critical)" },
          { label: "Recov Prob", value: (overview?.metrics?.recovery_success_rate || 0) + "%", icon: Target, color: "var(--color-success)" }
        ].map((kpi, i) => (
          <div key={i} className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-4 flex flex-col justify-between h-[100px] relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">{kpi.label}</span>
              <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight z-10" style={{ color: "white" }}>{kpi.value}</span>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl" style={{ backgroundColor: kpi.color }}></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column - Deep Charts */}
        <div className="col-span-7 flex flex-col gap-6">
          
          <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 h-[280px] flex flex-col relative overflow-hidden">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-primary)]">Enterprise Health Trajectory // 30D</h3>
               <span className="text-[9px] uppercase font-mono text-[var(--color-text-muted)]">Live Telemetry</span>
             </div>
             <div className="flex-1 w-full h-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={healthData || []}>
                   <defs>
                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" stroke="var(--color-border-active)" fontSize={9} fontFamily="monospace" tickLine={false} axisLine={false} />
                   <YAxis stroke="var(--color-border-active)" fontSize={9} fontFamily="monospace" tickLine={false} axisLine={false} domain={['dataMin - 5', 100]} />
                   <Tooltip contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} itemStyle={{ color: '#00E5FF' }} labelStyle={{ color: '#8b9bb4' }} />
                   <Area type="step" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--color-primary)] opacity-50"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--color-primary)] opacity-50"></div>
          </div>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex flex-col relative">
              <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-warning)] mb-2">Vector Threat Surface</h3>
              <div className="flex-1 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData || []}>
                    <PolarGrid stroke="var(--color-border-subtle)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'monospace' }} />
                    <Radar name="Threat" dataKey="A" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.2} strokeWidth={1} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} itemStyle={{ color: '#00E5FF' }} labelStyle={{ color: '#8b9bb4' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-5 flex flex-col overflow-hidden relative">
               <h3 className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-text-muted)] mb-4">Monte Carlo Forecast</h3>
               <div className="flex flex-col gap-3 flex-1 justify-center">
                 {outcomes && (outcomes as any[]).slice(0, 3).map((item: any, idx: number) => {
                   const colors = [
                     'text-[var(--color-success)] border-[var(--color-success)] bg-[var(--color-success)]',
                     'text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]',
                     'text-[var(--color-critical)] border-[var(--color-critical)] bg-[var(--color-critical)]'
                   ];
                   const colorClass = colors[idx % colors.length];
                   const [textColor, borderColor] = colorClass.split(' ');
                   
                   return (
                     <div key={item.id} className={`flex justify-between items-center p-2 border-l-2 ${borderColor} bg-white/[0.02]`}>
                       <div>
                         <div className={`font-bold text-[10px] uppercase tracking-wider ${textColor}`}>{item.label}</div>
                         <div className="text-[9px] font-mono text-[var(--color-text-muted)]">P({(item.count/100).toFixed(1)}%)</div>
                       </div>
                       <div className="font-mono font-bold text-sm tracking-tighter">
                         {item.impact > 0 ? '+' : ''}{item.impact}M
                       </div>
                     </div>
                   )
                 })}
                 {(!outcomes || outcomes.length === 0) && (
                   <div className="text-[9px] font-mono text-[var(--color-text-muted)] italic">No simulation data available</div>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Right Column - Streams & Synthesis */}
        <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
          
          <div className="bg-[var(--color-panel)] border border-[var(--color-primary)]/30 p-5 flex flex-col min-h-[220px] relative">
            <div className="absolute top-0 right-0 px-2 py-1 bg-[var(--color-primary)]/10 border-b border-l border-[var(--color-primary)]/30 text-[8px] font-mono text-[var(--color-primary)] uppercase">
              Ollama // Exec Mode
            </div>
            <h3 className="text-[10px] uppercase font-mono tracking-widest text-white mb-3 flex items-center gap-2">
               <Binary className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Executive Synthesis
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-[11px] leading-relaxed text-gray-300 font-sans tracking-wide">
                {execSummary?.briefing || "Polling intelligence layers... Awaiting synthesis vectors..."}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex justify-between text-[8px] font-mono text-[var(--color-text-muted)] uppercase">
              <span>Model: qwen2.5:14b</span>
              <span>Confidence: 94.2%</span>
            </div>
          </div>

          <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] flex flex-col flex-1 overflow-hidden">
            <div className="p-3 border-b border-[var(--color-border-subtle)] bg-white/[0.02] flex justify-between items-center">
              <h3 className="text-[10px] uppercase font-mono tracking-widest text-white flex items-center gap-2">
                 <Activity className="w-3.5 h-3.5 text-[var(--color-critical)]" /> Network Telemetry
              </h3>
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-critical)] animate-pulse"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, height: 0, x: -10 }}
                    animate={{ opacity: 1, height: "auto", x: 0 }}
                    className="p-2 border border-white/[0.05] bg-black/20 relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                      event.severity === 'CRITICAL' ? 'bg-[var(--color-critical)]' :
                      event.severity === 'HIGH' ? 'bg-[#F97316]' :
                      event.severity === 'MEDIUM' ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-primary)]'
                    }`}></div>
                    <div className="flex justify-between items-start pl-2 mb-1">
                      <div className="font-bold text-[10px] uppercase tracking-wide text-gray-200 truncate pr-2">{event.title}</div>
                      <div className="text-[8px] font-mono text-[var(--color-text-muted)] shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div className="text-[9px] text-gray-400 pl-2 line-clamp-2 leading-tight">{event.description}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Far Right Column - Status & Actions */}
        <div className="col-span-2 flex flex-col gap-6 overflow-hidden">
          {/* Scenario Timeline */}
          <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-4 flex flex-col gap-3">
             <h3 className="text-[9px] uppercase font-mono tracking-widest text-gray-400 border-b border-[var(--color-border-subtle)] pb-2">Scenario Timeline</h3>
             <div className="flex flex-col gap-2">
               {(execSummary?.timeline || []).map((item: any, idx: number) => (
                 <div key={idx} className="flex justify-between items-center text-[9px] font-mono">
                   <div className="flex items-center gap-1.5">
                     <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'completed' ? 'bg-[var(--color-success)]' : item.status === 'pending' ? 'bg-gray-600' : 'bg-[var(--color-primary)] animate-pulse'}`}></div>
                     <span className={item.status === 'pending' ? 'text-gray-500' : 'text-gray-200'}>{item.title}</span>
                   </div>
                 </div>
               ))}
               {(!execSummary?.timeline || execSummary.timeline.length === 0) && (
                 <div className="text-[9px] font-mono text-gray-600 italic">No scenario active</div>
               )}
             </div>
          </div>

          {/* Connected Systems */}
          <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-4 flex flex-col gap-3">
             <h3 className="text-[9px] uppercase font-mono tracking-widest text-gray-400 border-b border-[var(--color-border-subtle)] pb-2">Connected Systems</h3>
             <div className="flex flex-col gap-2">
               {(systemStatus || []).map((sys: any, idx: number) => (
                 <div key={idx} className="flex justify-between items-center text-[9px] font-mono">
                   <span className="text-gray-300 truncate max-w-[70px]">{sys.connector_type}</span>
                   <span className={sys.status === 'COMPLETED' ? 'text-[var(--color-success)]' : sys.status === 'PENDING' ? 'text-[var(--color-warning)]' : 'text-[var(--color-primary)]'}>{sys.status}</span>
                 </div>
               ))}
               {(!systemStatus || systemStatus.length === 0) && (
                 <div className="text-[9px] font-mono text-gray-600 italic">No execution data</div>
               )}
             </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-4 flex flex-col gap-2 flex-1">
             <h3 className="text-[9px] uppercase font-mono tracking-widest text-gray-400 mb-1">Quick Actions</h3>
             <button className="w-full text-left bg-white/[0.02] hover:bg-[var(--color-primary)]/10 border border-[var(--color-border-subtle)] p-2 rounded-sm text-[9px] font-mono text-gray-300 transition-colors">
               &gt; Run Scenario
             </button>
             <button className="w-full text-left bg-white/[0.02] hover:bg-[var(--color-primary)]/10 border border-[var(--color-border-subtle)] p-2 rounded-sm text-[9px] font-mono text-gray-300 transition-colors">
               &gt; Launch War Room
             </button>
             <button className="w-full text-left bg-white/[0.02] hover:bg-[var(--color-primary)]/10 border border-[var(--color-border-subtle)] p-2 rounded-sm text-[9px] font-mono text-gray-300 transition-colors">
               &gt; Generate Report
             </button>
          </div>
        </div>

      </div>
      
    </div>
  )
}
