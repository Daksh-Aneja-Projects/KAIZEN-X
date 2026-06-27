"use client"

import { motion } from "framer-motion"

export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Hexagon / Cube motif */}
      <motion.path 
        d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" 
        stroke="var(--color-primary)" 
        strokeWidth="3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {/* K / X internal topology */}
      <motion.path 
        d="M30 30L50 50M70 30L50 50M50 50V80M30 70L50 50M70 70L50 50" 
        stroke="white" 
        strokeWidth="4" 
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
      />

      {/* Pulsing Core */}
      <motion.circle 
        cx="50" cy="50" r="5" 
        fill="var(--color-primary)"
        animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  )
}
