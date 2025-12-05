'use client'

import { ArrowDown01Icon, PlusSignIcon, Search01Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const styles = {
  topBar: {
    height: '56px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--op-space-medium)',
    borderBottom: '1px solid var(--op-color-neutral-plus-five)',
    backgroundColor: 'var(--op-color-neutral-plus-seven)',
    gap: 'var(--op-space-medium)',
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-neutral-on-plus-eight)',
    flexShrink: 0,
  },
  logoBlock: {
    width: '24px',
    height: '24px',
    backgroundColor: 'var(--op-color-primary-base)',
    borderRadius: 'var(--op-radius-small)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--op-color-primary-on-base)',
    fontWeight: 700,
    fontSize: '14px',
  },
  breadcrumbItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-small)',
    fontWeight: 500,
  },
  badgePill: {
    border: '1px solid var(--op-color-border)',
    borderRadius: '99px',
    padding: '2px 8px',
    fontSize: '11px',
    color: 'var(--op-color-neutral-on-plus-max)',
    fontWeight: 400,
  },
  breadcrumbSeparator: {
    color: 'var(--op-color-neutral-on-plus-max)',
  },
  agentButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-x-small)',
    padding: 'var(--op-space-x-small) var(--op-space-small)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 'var(--op-radius-medium)',
    fontWeight: 500,
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-on-background)',
  },
  popoverContent: {
    width: '360px',
    padding: 0,
  },
  searchContainer: {
    padding: 'var(--op-space-small)',
    borderBottom: '1px solid var(--op-color-border)',
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: 'calc(var(--op-space-small) + var(--op-space-x-small))',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    color: 'var(--op-color-neutral-on-plus-max)',
  },
  searchInput: {
    paddingLeft: 'calc(var(--op-space-large) + var(--op-space-x-small))',
  },
  agentsList: {
    maxHeight: '300px',
    overflowY: 'auto' as const,
    padding: 'var(--op-space-small)',
    gap: 'var(--op-space-small)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  agentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-small)',
    padding: 'var(--op-space-small) var(--op-space-medium)',
    cursor: 'pointer',
  },
  agentItemSelected: {
    backgroundColor: 'var(--op-color-neutral-plus-six)',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  createAgentButton: {
    width: '100%',
    justifyContent: 'flex-start',
    gap: 'var(--op-space-small)',
  },
}

interface Agent {
  id: string
  name: string
  display_name?: string
}

export function TopBar() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Load agents from API
  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch('/api/agents')
        const data = await res.json()
        if (data.agents) {
          setAgents(data.agents)
          if (data.agents.length > 0 && !selectedAgent) {
            setSelectedAgent(data.agents[0])
          }
        }
      } catch (error) {
        console.error('Failed to load agents:', error)
      }
    }
    loadAgents()
  }, [selectedAgent])

  const filteredAgents = agents.filter((agent) =>
    (agent.display_name || agent.name).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateAgent = async () => {
    const agentName = prompt('Enter agent name:')
    if (!agentName) return

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agentName }),
      })
      const data = await res.json()
      if (data.agent) {
        setAgents([data.agent, ...agents])
        setSelectedAgent(data.agent)
      }
    } catch (error) {
      console.error('Failed to create agent:', error)
      alert('Failed to create agent')
    } finally {
      setIsOpen(false)
    }
  }

  return (
    <header style={styles.topBar} className="app__header">
      <div style={styles.logoBlock}>R</div>

      <div style={styles.breadcrumbItem}>
        <span>User Name</span>
      </div>

      <span style={styles.breadcrumbSeparator}>/</span>

      {selectedAgent && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button style={styles.agentButton}>
              <span>{selectedAgent.display_name || selectedAgent.name}</span>
              <span style={styles.badgePill}>Agent</span>
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent style={styles.popoverContent} align="start">
            <div style={styles.searchContainer}>
              <div style={styles.searchIcon}>
                <HugeiconsIcon icon={Search01Icon} size={16} />
              </div>
              <Input
                placeholder="Search Agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.agentsList}>
              {filteredAgents.map((agent) => (
                <Button
                  size="lg"
                  width="full"
                  key={agent.id}
                  variant="ghost"
                  style={{
                    ...(selectedAgent.id === agent.id ? styles.agentItemSelected : {}),
                  }}
                  onClick={() => {
                    setSelectedAgent(agent)
                    setIsOpen(false)
                  }}
                >
                  <span>{agent.display_name || agent.name}</span>
                  {selectedAgent.id === agent.id && (
                    <span style={styles.checkIcon}>✓</span>
                  )}
                </Button>
              ))}


              <Button
                variant="primary"
                size="lg"
                width="full"
                style={styles.createAgentButton}
                onClick={handleCreateAgent}
              >
                <HugeiconsIcon icon={PlusSignIcon} size={18} />
                Create agent
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </header>
  )
}
