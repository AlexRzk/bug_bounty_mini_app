import React from 'react'
import './glowing-button.css'

interface GlowingButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function GlowingButton({ children, onClick, className = '', type = 'button' }: GlowingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`glowing-button ${className}`}
    >
      {children}
    </button>
  )
}
