import { useEffect, useState, type ReactNode } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'sj-theme-mode'

const getSystemPreference = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

const applyThemeClass = (mode: ThemeMode) => {
  const root = document.documentElement
  const resolvedMode = mode === 'system' ? (getSystemPreference() ? 'dark' : 'light') : mode
  root.classList.toggle('dark', resolvedMode === 'dark')
}

const items: Array<{ value: ThemeMode; label: string; icon: ReactNode }> = [
  { value: 'light', label: '淺色模式', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: '深色模式', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: '自動偵測', icon: <Monitor className="h-4 w-4" /> },
]

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setMode(stored)
        applyThemeClass(stored)
      } else {
        applyThemeClass('system')
      }
    } catch (error) {
      console.error('Failed to load theme preference', error)
      applyThemeClass('system')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } catch (error) {
      console.error('Failed to persist theme preference', error)
    }
    applyThemeClass(mode)
  }, [mode, mounted])

  useEffect(() => {
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyThemeClass('system')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [mode])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9">
          <span className="sr-only">切換主題</span>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {items.map(({ value, label, icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setMode(value)}
            className="flex items-center justify-between gap-2"
          >
            <span>{label}</span>
            <span
              className={cn(
                'rounded-full border border-transparent p-1 transition-colors',
                value === mode && 'border-primary bg-primary/10 text-primary',
              )}
            >
              {icon}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
