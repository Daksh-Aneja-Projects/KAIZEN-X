"use client"

import { Search, Command, Bell, Clock, Cpu, LayoutDashboard, Box, Activity, BrainCircuit, ShieldAlert, Zap, Users, Globe } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const COMMANDS = [
  { id: 'nav-dashboard', name: 'Go to Mission Control', type: 'Navigation', path: '/', icon: LayoutDashboard },
  { id: 'nav-twin', name: 'Go to Digital Twin', type: 'Navigation', path: '/twin', icon: Box },
  { id: 'nav-observatory', name: 'Go to Observatory', type: 'Navigation', path: '/observatory', icon: Activity },
  { id: 'nav-warroom', name: 'Go to War Room', type: 'Navigation', path: '/war-room', icon: BrainCircuit },
  { id: 'nav-decision', name: 'Go to Decision Studio', type: 'Navigation', path: '/decision-studio', icon: ShieldAlert },
  { id: 'nav-recovery', name: 'Go to Recovery Center', type: 'Navigation', path: '/recovery-center', icon: Zap },
  { id: 'nav-boardroom', name: 'Go to Boardroom', type: 'Navigation', path: '/boardroom', icon: Users },
  { id: 'nav-orchestrator', name: 'Go to Scenario Orchestrator', type: 'Navigation', path: '/orchestrator', icon: Globe },
  { id: 'action-demo', name: 'Trigger Event Simulation', type: 'Action', path: '/orchestrator', icon: Zap },
]

export default function Topbar() {
  const [time, setTime] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC')
    }
    updateTime()
    const int = setInterval(updateTime, 1000)
    return () => clearInterval(int)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(open => !open)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    if (searchOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  const filteredCommands = COMMANDS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const executeCommand = (cmd: any) => {
    setSearchOpen(false)
    router.push(cmd.path)
  }

  return (
    <header className="h-[60px] bg-[var(--color-background)] border-b border-[var(--color-border-subtle)] flex items-center justify-between px-6 shrink-0 relative z-50">
      
      {/* Command Palette Trigger */}
      <div className="flex items-center w-[400px]">
        <div className="relative w-full cursor-text" onClick={() => setSearchOpen(true)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
          <div className="w-full bg-[var(--color-panel)] border border-[var(--color-border-subtle)] rounded pl-10 pr-4 py-2 text-xs text-gray-500 hover:border-[var(--color-border-active)] transition-colors flex justify-between items-center">
            <span>Search nodes, run simulations, query AI...</span>
            <kbd className="px-1.5 py-0.5 bg-black border border-[var(--color-border-subtle)] rounded text-[9px] font-mono text-[var(--color-text-muted)] flex items-center gap-1 shadow-sm">
              <Command className="w-3 h-3" /> K
            </kbd>
          </div>
        </div>
      </div>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start pt-[10vh]">
            <motion.div 
              ref={searchRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-[var(--color-panel)] border border-[var(--color-primary)]/30 rounded-lg shadow-[0_0_50px_rgba(0,229,255,0.1)] overflow-hidden flex flex-col"
            >
              <div className="relative p-4 border-b border-[var(--color-border-subtle)] flex items-center gap-3">
                <Search className="w-5 h-5 text-[var(--color-primary)]" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Type a command or search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-gray-600"
                />
                <kbd className="px-2 py-1 bg-black border border-[var(--color-border-subtle)] rounded text-[10px] font-mono text-gray-400">ESC</kbd>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredCommands.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-mono">Suggestions</div>
                    {filteredCommands.map((cmd) => (
                      <button 
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        className="w-full text-left px-3 py-3 rounded flex items-center justify-between hover:bg-[var(--color-primary)]/10 group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <cmd.icon className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-primary)]" />
                          <span className="text-sm text-gray-200 group-hover:text-white">{cmd.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono group-hover:text-[var(--color-primary)]">{cmd.type}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 font-mono text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Right Side Stats */}
      <div className="flex items-center gap-6">
        
        {/* Environment Label */}
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[var(--color-warning)]" />
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-warning)] font-mono border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-2 py-0.5 rounded">
            PROD_ENV
          </span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-2 text-[var(--color-text-muted)] font-mono text-[10px]">
          <Clock className="w-3 h-3" />
          <span>{time}</span>
        </div>

        <div className="w-px h-6 bg-[var(--color-border-subtle)]"></div>

        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--color-critical)] rounded-full border-2 border-[var(--color-background)]"></span>
        </button>

        {/* User Profile */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-blue-600 flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)] cursor-pointer text-white border border-[var(--color-primary)]/30">
          KX
        </div>
      </div>
      
    </header>
  )
}
