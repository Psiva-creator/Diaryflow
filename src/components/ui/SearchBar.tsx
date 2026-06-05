'use client'
import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  children?: ReactNode
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', children }: SearchBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field pl-9"
        />
      </div>
      {children}
    </div>
  )
}
