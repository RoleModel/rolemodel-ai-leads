'use client'

import { RefreshIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function PlaygroundConfig() {
  const router = useRouter()
  const [model, setModel] = useState('claude-3-haiku')
  const [temperature, setTemperature] = useState(0)
  const [instructions, setInstructions] = useState(`### Business Context
RoleModel Software is a custom software development company that specializes in creating tailored solutions to enhance business workflows and integrate with third-party applications. With nearly 30 years of experience, they focus on understanding client needs, iterative development, and building sustainable software that scales with the business. Their key services include web and mobile app development, UI/UX design, and expertise amplification, aiming to optimize performance and reduce inefficiencies through custom software solutions.`)

  return (
    <div
      style={{
        width: '400px',
        borderRight: '1px solid var(--op-color-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--op-color-background)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--op-space-large)',
          borderBottom: '1px solid var(--op-color-border)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--op-font-x-large)',
            fontWeight: 'var(--op-font-weight-bold)',
            margin: 0,
          }}
        >
          Playground
        </h1>

        {/* Training Status */}
        <div
          style={{
            marginTop: 'var(--op-space-medium)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--op-space-2x-small)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--op-color-success)',
            }}
          />
          <span
            style={{
              fontSize: 'var(--op-font-small)',
              fontWeight: 'var(--op-font-weight-medium)',
            }}
          >
            Trained
          </span>
        </div>
        <div
          style={{
            fontSize: 'var(--op-font-x-small)',
            color: 'var(--op-color-neutral-on-plus-max)',
            marginTop: 'var(--op-space-3x-small)',
          }}
        >
          Last trained 18 hours ago • 58 KB
        </div>
      </div>

      {/* Configuration Options */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--op-space-large)',
        }}
      >
        {/* Compare Models */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--op-space-large)',
            padding: 'var(--op-space-small) var(--op-space-medium)',
            border: '1px solid var(--op-color-border)',
            backgroundColor: 'var(--op-color-background)',
            borderRadius: 'var(--op-radius-medium)',
          }}
        >
          <span style={{ fontSize: 'var(--op-font-small)' }}>Compare AI models</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/playground/compare')}
          >
            Compare
          </Button>
        </div>

        {/* Model Selection */}
        <div style={{ marginBottom: 'var(--op-space-large)' }}>
          <label
            htmlFor="playground-model"
            style={{
              display: 'block',
              fontSize: 'var(--op-font-small)',
              fontWeight: 'var(--op-font-weight-medium)',
              marginBottom: 'var(--op-space-small)',
            }}
          >
            Model
          </label>
          <select
            id="playground-model"
            className="form-control"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="claude-3-haiku">Claude 3 Haiku</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>

        {/* Temperature */}
        <div style={{ marginBottom: 'var(--op-space-large)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--op-space-small)',
            }}
          >
            <label
              htmlFor="playground-temperature"
              style={{
                fontSize: 'var(--op-font-small)',
                fontWeight: 'var(--op-font-weight-medium)',
              }}
            >
              Temperature
            </label>
            <span
              style={{
                fontSize: 'var(--op-font-small)',
                fontWeight: 'var(--op-font-weight-bold)',
              }}
            >
              {temperature}
            </span>
          </div>
          <input
            id="playground-temperature"
            type="range"
            min="0"
            max="100"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            style={{ width: '100%' }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={temperature}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--op-font-x-small)',
              color: 'var(--op-color-neutral-on-plus-max)',
              marginTop: 'var(--op-space-2x-small)',
            }}
          >
            <span>Reserved</span>
            <span>Creative</span>
          </div>
        </div>

        {/* AI Actions */}
        <div style={{ marginBottom: 'var(--op-space-large)' }}>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--op-font-small)',
              fontWeight: 'var(--op-font-weight-medium)',
              marginBottom: 'var(--op-space-small)',
            }}
          >
            AI Actions
          </label>
          <div
            style={{
              padding: 'var(--op-space-large)',
              border: '1px solid var(--op-color-border)',
              borderRadius: 'var(--op-radius-medium)',
              textAlign: 'center',
              color: 'var(--op-color-neutral-on-plus-max)',
              fontSize: 'var(--op-font-small)',
            }}
          >
            No actions found
          </div>
        </div>

        {/* Instructions */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--op-space-small)',
            }}
          >
            <label
              htmlFor="playground-instructions"
              style={{
                fontSize: 'var(--op-font-small)',
                fontWeight: 'var(--op-font-weight-medium)',
              }}
            >
              Instructions (System prompt)
            </label>
            <Button variant="secondary" size="sm">
              <HugeiconsIcon icon={RefreshIcon} size={16} />
            </Button>
          </div>
          <select
            id="playground-instructions"
            className="form-control"
            defaultValue="base"
            style={{ marginBottom: 'var(--op-space-small)' }}
          >
            <option value="base">Base Instructions</option>
            <option value="custom">Custom Instructions</option>
          </select>
          <textarea
            id="playground-instructions-textarea"
            className="form-control"
            aria-labelledby="playground-instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={12}
            style={{
              fontFamily: 'monospace',
              fontSize: 'var(--op-font-x-small)',
              resize: 'vertical',
            }}
          />
        </div>
      </div>
    </div>
  )
}
