'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  AppWindow, 
  Activity, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  LifeBuoy,
  Sun,
  Moon
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, category: 'Organization' },
  { name: 'Documents', href: '/documents', icon: FileText, category: 'Organization' },
  { name: 'Templates', href: '/templates', icon: AppWindow, category: 'Organization' },
  { name: 'Activity Log', href: '/activity-logs', icon: Activity, category: 'Management' },
  { name: 'Settings', href: '/settings', icon: Settings, category: 'Management' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const categories = Array.from(new Set(navigation.map(item => item.category)))

  return (
    <div className="flex grow flex-col h-screen fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-zinc-900 border-r border-border dark:border-zinc-800 overflow-hidden transition-colors duration-300">
      {/* Brand Header */}
      <div className="flex h-[120px] shrink-0 items-center justify-center border-b border-border dark:border-zinc-800 px-6">
        <img src="/logo.png" alt="DocuForge Logo" className="h-28 w-auto object-contain transition-transform hover:scale-105 duration-300" />
      </div>
      
      {/* Navigation */}
      <div className="flex flex-1 flex-col p-6 gap-8 overflow-y-auto scrollbar-hide pb-28">
        {categories.map((category) => (
          <div key={category} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-widest pl-2 opacity-70">
              {category}
            </h3>
            <div className="flex flex-col gap-1">
              {navigation
                .filter(item => item.category === category)
                .map((item) => {
                  const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-[20px] p-4 gap-3 transition-all duration-300",
                        isActive 
                          ? "bg-muted dark:bg-zinc-800 text-foreground dark:text-white" 
                          : "text-secondary hover:bg-muted dark:hover:bg-zinc-800 hover:text-foreground dark:hover:text-white"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6 shrink-0 transition-colors duration-200",
                          isActive ? "text-foreground dark:text-white" : "text-secondary group-hover:text-foreground dark:group-hover:text-white"
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn(
                        "font-medium transition-all duration-300",
                        isActive ? "font-bold" : ""
                      )}>
                        {item.name}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-6 bg-primary rounded-full" />
                      )}
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Support & Theme Toggle */}
      <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t border-border dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between gap-3 bg-muted/30 dark:bg-zinc-800/50 p-3 rounded-2xl">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground dark:text-white text-sm truncate">Sarah Connor</p>
            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={() => logout()}
                className="text-[10px] text-secondary hover:text-primary transition-colors font-bold uppercase tracking-wider"
              >
                Sign Out
              </button>
              <span className="size-1 bg-secondary/30 rounded-full" />
              {mounted && (
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-[10px] text-secondary hover:text-primary transition-colors font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  {theme === 'dark' ? <Sun className="size-3" /> : <Moon className="size-3" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              )}
            </div>
          </div>
          <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/5">
            <LifeBuoy className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
