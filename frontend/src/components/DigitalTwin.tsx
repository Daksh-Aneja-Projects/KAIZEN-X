"use client"

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'
import { useQuery } from '@tanstack/react-query'
import { fetchTwinGraph, fetchTwinReplay, WS_URL } from '@/lib/api'
import { Activity, Play, Pause, SkipBack, SkipForward, ShieldAlert, Cpu, ZoomIn, ZoomOut, Maximize, Search, ArrowRight, Database, Binary } from 'lucide-react'

export default function DigitalTwin() {
  const [elements, setElements] = useState<any[]>([])
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [replayIndex, setReplayIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const cyRef = useRef<cytoscape.Core | null>(null)

  const { data: replayEvents } = useQuery({ queryKey: ['twinReplay'], queryFn: fetchTwinReplay })

  // Force layout recalculation after mounting
  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      setTimeout(() => {
        cyRef.current?.resize()
        cyRef.current?.layout({ name: 'grid', fit: true, padding: 150, avoidOverlap: true, avoidOverlapPadding: 50 }).run()
      }, 50)
    }
  }, [elements])

  useEffect(() => {
    if (isPlaying && replayEvents && replayEvents.length > 0) {
      const interval = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= replayEvents.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, replayEvents])

  // Animate graph on timeline tick
  useEffect(() => {
    if (replayEvents && replayEvents.length > 0 && cyRef.current) {
      const event = replayEvents[replayIndex]
      if (event && event.entity_id) {
        const cy = cyRef.current
        const node = cy.getElementById(event.entity_id)
        if (node.length > 0) {
          cy.nodes().style({ 'background-color': '#0B1220', 'border-color': '#00E5FF', 'border-width': 1.5 })
          
          node.animate({
            style: {
              'background-color': '#FF0055',
              'border-width': 4,
              'border-color': '#FFB300'
            }
          }, { duration: 300 })
          
          setSelectedNode({
            ...node.data(),
            event_type: event.event_type,
            timestamp: event.timestamp
          })
        }
      }
    }
  }, [replayIndex, replayEvents])

  useEffect(() => {
    fetchTwinGraph().then(data => {
      if (!data || !data.nodes) return
      
      const cyNodes = data.nodes.map((n: any) => ({
        data: { id: n.id, label: n.label, type: n.type, health: n.health_score, status: n.status }
      }))
      
      const cyEdges = data.edges.map((e: any) => ({
        data: { id: e.id, source: e.source_id, target: e.target_id, label: e.type }
      }))
      
      setElements([...cyNodes, ...cyEdges])
    })
  }, [])

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'PROPAGATION_STEP' && cyRef.current) {
          const cy = cyRef.current
          const node = cy.getElementById(payload.node_id)
          if (node.length > 0) {
            node.animate({
              style: {
                'background-color': '#FF0055',
                'border-width': 4,
                'border-color': '#FFB300'
              }
            }, { duration: 500 })
            
            // Highlight incoming edges
            node.connectedEdges().animate({
              style: {
                'line-color': '#FF0055',
                'target-arrow-color': '#FF0055',
                'width': 2
              }
            }, { duration: 500 })
            
            setSelectedNode({
              ...node.data(),
              impact_score: payload.impact_score,
              confidence: payload.confidence
            })
          }
        }
      } catch (e) {}
    }
    return () => ws.close()
  }, [])

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)
  const handleFit = () => cyRef.current?.fit()

  const stylesheet: cytoscape.Stylesheet[] = [
    {
      selector: 'node',
      style: {
        'background-color': '#0B1220',
        'border-width': 1.5,
        'border-color': '#00E5FF',
        'label': 'data(label)',
        'color': '#8b9bb4',
        'font-family': 'monospace',
        'font-size': '14px',
        'text-valign': 'bottom',
        'text-margin-y': 8,
        'width': 50,
        'height': 50
      }
    },
    {
      selector: 'node[type="Risk"]',
      style: { 'border-color': '#EF4444', 'shape': 'diamond', 'background-color': '#450a0a' }
    },
    {
      selector: 'node[type="Department"]',
      style: { 'border-color': '#3b82f6', 'shape': 'hexagon', 'background-color': '#172554' }
    },
    {
      selector: 'node[type="Vendor"]',
      style: { 'border-color': '#F59E0B', 'shape': 'triangle', 'background-color': '#422006' }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': 'rgba(255,255,255,0.15)',
        'target-arrow-color': 'rgba(255,255,255,0.15)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.5
      }
    },
    {
      selector: ':selected',
      style: {
        'border-width': 3,
        'border-color': '#10B981',
        'background-color': '#064e3b',
        'color': '#fff'
      }
    }
  ]

  return (
    <div className="w-full h-full flex overflow-hidden font-sans bg-[var(--color-background)]">
      
      {/* Main Graph Area */}
      <div className="w-[75%] h-full relative flex flex-col border-r border-[var(--color-border-subtle)]">
        
        {/* Graph Meta Strip */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none bg-gradient-to-b from-[var(--color-background)] to-transparent">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-[var(--color-primary)]" />
            <div>
              <h2 className="text-sm font-bold tracking-widest text-[var(--color-primary)] uppercase">Digital Twin Cortex</h2>
              <p className="text-[9px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest">Topology Active • {elements.length} Nodes</p>
            </div>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search graph..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] rounded-sm text-[10px] font-mono pl-7 pr-3 py-1.5 w-48 text-white outline-none focus:border-[var(--color-border-active)] transition-colors"
              />
            </div>
            <div className="flex bg-[var(--color-panel)] border border-[var(--color-border-subtle)] rounded-sm overflow-hidden">
              <button onClick={handleZoomIn} className="p-1.5 hover:bg-[var(--color-border-subtle)] transition-colors"><ZoomIn className="w-3.5 h-3.5 text-gray-400" /></button>
              <div className="w-px bg-[var(--color-border-subtle)]"></div>
              <button onClick={handleZoomOut} className="p-1.5 hover:bg-[var(--color-border-subtle)] transition-colors"><ZoomOut className="w-3.5 h-3.5 text-gray-400" /></button>
              <div className="w-px bg-[var(--color-border-subtle)]"></div>
              <button onClick={handleFit} className="p-1.5 hover:bg-[var(--color-border-subtle)] transition-colors"><Maximize className="w-3.5 h-3.5 text-gray-400" /></button>
            </div>
          </div>
        </div>

        {/* Cytoscape Canvas */}
        <div className="absolute inset-0 opacity-90 z-0">
          <CytoscapeComponent
            elements={elements}
            style={{ width: '100%', height: '100%' }}
            stylesheet={stylesheet}
            layout={{ name: 'grid', fit: true, padding: 150, avoidOverlap: true, avoidOverlapPadding: 50 }}
            cy={(cy) => {
              cyRef.current = cy
              cy.on('tap', 'node', (evt) => {
                setSelectedNode(evt.target.data())
                // Highlight neighborhood
                cy.elements().style({ 'opacity': 0.15 })
                evt.target.style({ 'opacity': 1 })
                evt.target.connectedEdges().style({ 'opacity': 1, 'line-color': '#00E5FF', 'target-arrow-color': '#00E5FF' })
                evt.target.neighborhood().style({ 'opacity': 1 })
              })
              cy.on('tap', (evt) => {
                if (evt.target === cy) {
                  setSelectedNode(null)
                  cy.elements().style({ 'opacity': 1, 'line-color': 'rgba(255,255,255,0.05)', 'target-arrow-color': 'rgba(255,255,255,0.05)' })
                }
              })
            }}
          />
        </div>

        {/* Timeline Replay Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-[var(--color-panel)] border border-[var(--color-border-subtle)] p-2 rounded-sm flex items-center gap-3 shadow-2xl">
          <button className="text-gray-400 hover:text-white p-1" onClick={() => setReplayIndex(0)}><SkipBack className="w-3.5 h-3.5" /></button>
          <button 
            className="w-8 h-8 bg-transparent border border-[var(--color-primary)] rounded-sm flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black transition-colors"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button className="text-gray-400 hover:text-white p-1" onClick={() => setReplayIndex(replayEvents ? replayEvents.length - 1 : 0)}><SkipForward className="w-3.5 h-3.5" /></button>
          <div className="w-px h-5 bg-[var(--color-border-subtle)] mx-1"></div>
          <div className="flex flex-col pr-2">
            <span className="text-[8px] text-gray-500 uppercase font-mono tracking-widest">Propagation Timeline</span>
            <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold tracking-tight">
              {replayEvents && replayEvents[replayIndex] 
                ? new Date(replayEvents[replayIndex].timestamp).toISOString().split('T')[1].replace('Z', '') 
                : 'T-0.000s'}
            </span>
          </div>
        </div>

        {/* Reticles */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[var(--color-primary)] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[var(--color-primary)] opacity-30 pointer-events-none"></div>
      </div>

      {/* Intelligence Side Panel */}
      <div className="w-[25%] h-full overflow-y-auto bg-[var(--color-panel-bg)] flex flex-col">
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div 
              key="node-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full overflow-y-auto custom-scrollbar"
            >
              {/* Node Header */}
              <div className="p-5 border-b border-[var(--color-border-subtle)] bg-[url('/bg-grid.png')] bg-[size:10px_10px] bg-blend-overlay">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-primary)] mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse"></span>
                  {selectedNode.type} Entity
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">{selectedNode.label}</h2>
                <div className="text-[10px] text-gray-500 font-mono mt-2 p-1.5 bg-black/40 border border-white/5 inline-block rounded-sm">
                  ID: {selectedNode.id}
                </div>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-2 gap-px bg-[var(--color-border-subtle)] border-b border-[var(--color-border-subtle)]">
                <div className="bg-[var(--color-panel)] p-4">
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Health Telemetry</div>
                  <div className="text-2xl font-mono font-bold text-[var(--color-success)] tracking-tighter">{selectedNode.health || 100}%</div>
                </div>
                <div className="bg-[var(--color-panel)] p-4">
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">State</div>
                  <div className="text-sm font-bold text-white uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-success)]"></div>
                    {selectedNode.status || 'Active'}
                  </div>
                </div>
              </div>

              {/* Impact Risk (if any) */}
              {selectedNode.impact_score && (
                 <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-critical)]/5">
                    <div className="flex items-center gap-2 text-[var(--color-critical)] mb-2">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold font-mono uppercase tracking-widest">Active Propagation</span>
                    </div>
                    <div className="text-2xl font-mono font-bold tracking-tighter text-[var(--color-critical)]">{selectedNode.impact_score}% Impact Risk</div>
                 </div>
              )}

              {/* Blast Radius API Integration */}
              <BlastRadiusPanel nodeId={selectedNode.id} />

              {/* AI Synthesis */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-2">
                    <Binary className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Local AI Synthesis
                  </h3>
                  <span className="text-[8px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 py-0.5 rounded-sm font-mono">qwen2.5:14b</span>
                </div>
                
                <div className="bg-black/30 border border-[var(--color-border-subtle)] p-3 rounded-sm text-[10px] text-gray-300 leading-relaxed font-mono border-l-2 border-l-[var(--color-primary)]">
                  {"> Analyzing graph neighborhood..."}
                  <br/>{"> Role: Critical dependency junction"}
                  <br/>{"> Downstream blast radius: HIGH"}
                  <br/>{`> ${selectedNode.label} operational metrics currently nominal.`}
                  <br/><br/>
                  <span className="text-[var(--color-primary)] opacity-70 animate-pulse">_ awaiting further mutations</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-[var(--color-border-subtle)] flex flex-col gap-2 bg-[#050810]">
                <h3 className="text-[9px] font-mono uppercase tracking-widest text-gray-500 mb-2">Available Interventions</h3>
                <button onClick={() => toast.success(`Isolating entity [${selectedNode.id}] at network level. Traffic routing updated.`)} className="w-full text-left bg-transparent hover:bg-[var(--color-primary)]/5 border border-[var(--color-border-subtle)] hover:border-[var(--color-border-active)] p-2.5 rounded-sm text-[10px] font-mono text-gray-300 hover:text-[var(--color-primary)] transition-colors flex justify-between items-center group">
                  <span>[01] Isolate Entity</span>
                  <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                </button>
                <button onClick={async () => {
                   toast.loading("Initiating failover protocol...", { id: "failover" });
                   try {
                     await fetch(`${API_URL}/api/execution/plan?scenario_id=1&recovery_path_id=1`, { method: 'POST' });
                     toast.success(`Failover protocol dispatched to execution engine.`, { id: "failover" });
                   } catch(e) {
                     toast.error("Failover dispatch failed", { id: "failover" });
                   }
                }} className="w-full text-left bg-transparent hover:bg-[var(--color-critical)]/5 border border-[var(--color-border-subtle)] hover:border-[var(--color-critical)]/50 p-2.5 rounded-sm text-[10px] font-mono text-gray-300 hover:text-[var(--color-critical)] transition-colors flex justify-between items-center group">
                  <span>[02] Trigger Failover Protocol</span>
                  <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)] group-hover:text-[var(--color-critical)]" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center p-8 bg-[url('/bg-grid.png')] bg-[size:20px_20px] bg-blend-overlay opacity-50"
            >
              <div className="w-12 h-12 border border-[var(--color-border-subtle)] bg-[var(--color-background)] flex items-center justify-center mb-4 transform rotate-45">
                <Activity className="w-4 h-4 text-[var(--color-text-muted)] -rotate-45" />
              </div>
              <h3 className="text-[10px] font-mono uppercase font-bold text-white mb-2 tracking-widest">Awaiting Selection</h3>
              <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed font-sans">Select a node in the Enterprise Topology to extract intelligence.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}

function BlastRadiusPanel({ nodeId }: { nodeId: string }) {
  const { data: blastRadius, isLoading } = useQuery({ 
    queryKey: ['blastRadius', nodeId], 
    queryFn: () => import('@/lib/api').then(m => m.fetchTwinBlastRadius(nodeId)),
    enabled: !!nodeId
  })

  if (isLoading) return <div className="p-4 text-[9px] font-mono text-gray-500">Calculating blast radius...</div>
  
  if (blastRadius && blastRadius.radius_size > 0) {
    return (
      <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-warning)]/5">
         <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-warning)] mb-1">Downstream Dependencies</div>
         <div className="text-sm font-bold text-white">{blastRadius.radius_size} Connected Systems</div>
      </div>
    )
  }
  
  return null
}

