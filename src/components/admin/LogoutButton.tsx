'use client'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--op-space-small)',
        padding: '0 var(--op-space-small)',
        fontSize: '14px',
        color: 'var(--op-color-neutral-on-plus-max)',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        textDecoration: 'none',
        height: 'var(--op-input-height-large)',
        border: '1px solid var(--op-color-border)',
        borderRadius: '6px',
        backgroundColor: 'transparent',
      }}
      className="hover:bg-[var(--op-color-background)]"
    >
      Logout
    </button>
  )
}
