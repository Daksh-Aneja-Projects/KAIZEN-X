"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, LayoutDashboard, ShieldAlert, Zap, Box, BrainCircuit, Users, Database, Globe } from 'lucide-react'
import Logo from './Brand/Logo'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Mission Control', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Digital Twin', path: '/twin', icon: <Box className="w-4 h-4" /> },
    { name: 'Observatory', path: '/observatory', icon: <Activity className="w-4 h-4" /> },
    { name: 'War Room', path: '/war-room', icon: <BrainCircuit className="w-4 h-4" /> },
    { name: 'Decision Studio', path: '/decision-studio', icon: <ShieldAlert className="w-4 h-4" /> },
    { name: 'Recovery Center', path: '/recovery-center', icon: <Zap className="w-4 h-4" /> },
    { name: 'Boardroom', path: '/boardroom', icon: <Users className="w-4 h-4" /> },
    { name: 'Scenario Orchestrator', path: '/orchestrator', icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <div className="w-[260px] min-h-screen bg-[var(--color-panel)] border-r border-[var(--color-border-subtle)] flex flex-col font-sans">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-[var(--color-border-subtle)] flex items-center gap-4">
        <Logo className="w-8 h-8" />
        <div>
          <h1 className="text-lg font-black tracking-widest text-white">
            KAIZEN<span className="text-[var(--color-primary)]">-X</span>
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">Enterprise OS v1.0</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        <div className="px-5 mb-2 text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-mono">Modules</div>
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`px-5 py-2.5 mx-2 rounded flex items-center gap-3 text-xs tracking-wide transition-all ${
                isActive 
                  ? 'text-[#00E5FF] bg-[var(--color-primary-dim)] shadow-[inset_2px_0_0_0_#00E5FF]' 
                  : 'text-gray-400 hover:text-white hover:bg-[var(--color-panel-hover)]'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* System Metrics */}
      <div className="p-5 border-t border-[var(--color-border-subtle)] flex flex-col gap-3">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[var(--color-text-muted)] uppercase tracking-wider">Enterprise State</span>
          <span className="text-[var(--color-success)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></span> ONLINE
          </span>
        </div>
        
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-3 h-3" /> Graph Nodes
          </span>
          <span className="text-white font-bold">1,024</span>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-3 h-3" /> Local LLM
          </span>
          <span className="text-[var(--color-primary)] font-bold truncate max-w-[120px]">qwen2.5-coder:7b</span>
        </div>
      </div>
    </div>
  )
}
