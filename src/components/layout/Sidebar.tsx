'use client'

import {
  Analytics01Icon,
  ArrowDown01Icon,
  Database01Icon,
  File01Icon,
  GitCompareIcon,
  Globe02Icon,
  Message01Icon,
  QuestionIcon,
  Rocket01Icon,
  Settings02Icon,
  TextIcon,
  Time01Icon,
  UserIcon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LogoutButton } from '@/components/admin/LogoutButton'
import { Button } from '@/components/ui/button'

import { createClient } from '@/lib/supabase/client'

const styles = {
  navSidebar: {
    '--_op-sidebar-background-color': 'var(--op-color-neutral-plus-seven)',
    '--_op-sidebar-border-color': 'var(--op-color-border)',
    width: '260px',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: 'var(--op-space-x-small)',
    color: 'var(--op-color-neutral-on-plus-max)',
    flexShrink: 0,
    gap: 'var(--op-space-2x-small)',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-small)',
    padding: '0 var(--op-space-small)',
    fontSize: '14px',
    color: 'var(--op-color-neutral-on-plus-max)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textDecoration: 'none',
    height: 'var(--op-input-height-large)',
  },
  navItemActive: {
    backgroundColor: 'var(--op-color-background)',
    color: 'var(--op-color-primary-base)',
    fontWeight: 500,
    border: '1px solid var(--op-color-border)',
    borderRadius: '6px',
  },
}

export function NavigationSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(
    pathname.startsWith('/admin/sources')
  )
  const [isActivityExpanded, setIsActivityExpanded] = useState(
    pathname.startsWith('/admin/activity')
  )

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { href: '/admin/playground', icon: GitCompareIcon, label: 'Explore' },
    { href: '/admin/activity', icon: Time01Icon, label: 'Activity', expandable: true },
    { href: '/admin/analytics', icon: Analytics01Icon, label: 'Analytics' },
    { href: '/admin/sources', icon: Database01Icon, label: 'Sources', expandable: true },
    { href: '/admin/deploy', icon: Rocket01Icon, label: 'Deploy' },
  ]

  const activitySubItems = [
    { href: '/admin/activity/chat-logs', icon: Message01Icon, label: 'Chat logs' },
    { href: '/admin/activity/leads', icon: UserIcon, label: 'Leads' },
  ]

  const sourcesSubItems = [
    { id: 'files', icon: File01Icon, label: 'Files' },
    { id: 'text', icon: TextIcon, label: 'Text' },
    { id: 'website', icon: Globe02Icon, label: 'Website' },
    { id: 'qna', icon: QuestionIcon, label: 'Q&A' },
    { id: 'workflow', icon: Settings02Icon, label: 'Workflow' },
  ]

  const activeSection = searchParams.get('section') || 'files'

  return (
    <aside style={styles.navSidebar} className="sidebar" aria-label="Main navigation">
      <nav role="navigation" aria-label="Primary">
        {navItems.map((item) => {
          const ItemIcon = item.icon
          const isActive = pathname.startsWith(item.href)
          const isSourcesItem = item.href === '/admin/sources'
          const isActivityItem = item.href === '/admin/activity'

          return (
            <div key={item.href}>
              {item.expandable ? (
                <Button
                  variant="ghost"
                  width="full"
                  justify="start"
                  onClick={() => {
                    if (isSourcesItem) setIsSourcesExpanded(!isSourcesExpanded)
                    if (isActivityItem) setIsActivityExpanded(!isActivityExpanded)
                  }}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                    width: '100%',
                    border: 'none',
                    background: 'none',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    className="flex items-center flex-grow-1"
                    style={{ gap: 'var(--op-space-small)' }}
                  >
                    <HugeiconsIcon icon={ItemIcon} size={20} />
                    <span>{item.label}</span>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={20}
                    style={{
                      transform:
                        (isSourcesItem && isSourcesExpanded) ||
                        (isActivityItem && isActivityExpanded)
                          ? 'rotate(0deg)'
                          : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </Button>
              ) : (
                <Link
                  href={item.href}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                  }}
                >
                  <HugeiconsIcon icon={ItemIcon} size={20} />
                  <span>{item.label}</span>
                </Link>
              )}

              {/* Activity Sub-items */}
              {isActivityItem && isActivityExpanded && (
                <div style={{ paddingLeft: 'var(--op-space-medium)' }}>
                  {activitySubItems.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = pathname === subItem.href

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        style={{
                          ...styles.navItem,
                          padding: '6px var(--op-space-medium)',
                          borderLeft: '1px solid',
                          borderColor: 'var(--op-color-border)',
                          fontSize: '13px',
                          ...(isSubActive
                            ? {
                                color: 'var(--op-color-primary-base)',
                                borderColor: 'var(--op-color-primary-base)',
                                fontWeight: 500,
                              }
                            : {}),
                        }}
                      >
                        <HugeiconsIcon icon={SubIcon} size={20} />
                        <span>{subItem.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Sources Sub-items */}
              {isSourcesItem && isSourcesExpanded && (
                <div style={{ paddingLeft: 'var(--op-space-medium)' }}>
                  {sourcesSubItems.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = isActive && activeSection === subItem.id

                    return (
                      <Link
                        key={subItem.id}
                        href={`/admin/sources?section=${subItem.id}`}
                        style={{
                          ...styles.navItem,
                          padding: '6px var(--op-space-medium)',
                          borderLeft: '1px solid',
                          borderColor: 'var(--op-color-border)',
                          fontSize: '13px',
                          ...(isSubActive
                            ? {
                                color: 'var(--op-color-primary-base)',
                                borderColor: 'var(--op-color-primary-base)',
                                fontWeight: 500,
                              }
                            : {}),
                        }}
                      >
                        <HugeiconsIcon icon={SubIcon} size={20} />
                        <span>{subItem.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      {/* User section at bottom */}
      {user && (
        <div
          style={{
            marginTop: 'auto',
            padding: 'var(--op-space-small)',
            borderTop: '1px solid var(--op-color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--op-space-2x-small)',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: 'var(--op-color-neutral-on-plus-max)',
              opacity: 0.7,
              padding: '0 var(--op-space-small)',
            }}
          >
            {user.email}
          </span>
          <LogoutButton />
        </div>
      )}{' '}
    </aside>
  )
}
