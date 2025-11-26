'use client'

import { Tick01Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowDown01Icon } from '@hugeicons-pro/core-stroke-standard';

import { AVAILABLE_MODELS, getModelById, type ModelInfo } from '@/lib/ai/models'

import { Button } from './button'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface ModelSelectorProps {
  value: string
  onChange: (modelId: string) => void
  label?: string
  id?: string
}

export function ModelSelector({ value, onChange, label = 'Model', id }: ModelSelectorProps) {
  const [modelSearch, setModelSearch] = useState('')
  const [open, setOpen] = useState(false)

  const currentModel = getModelById(value) || AVAILABLE_MODELS[0]

  const filteredModels = AVAILABLE_MODELS.filter(
    (model) =>
      model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.provider.toLowerCase().includes(modelSearch.toLowerCase())
  )

  const handleSelect = (model: ModelInfo) => {
    onChange(model.id)
    setModelSearch('')
    setOpen(false)
  }

  return (
    <div>
      {label && (
        <Label
          htmlFor={id}
          style={{
            marginBottom: 'var(--op-space-small)',
            display: 'block',
            fontSize: 'var(--op-font-small)',
            fontWeight: 'var(--op-font-weight-medium)',
          }}
        >
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="secondary"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              gap: 'var(--op-space-small)',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Image
                src={currentModel.logo}
                alt={currentModel.name}
                width={20}
                height={20}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span style={{ flex: 1, textAlign: 'left' }}>{currentModel.name}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
              style={{
                transform: open ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          style={{ width: '300px', maxHeight: '400px', padding: 'var(--op-space-small)' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--op-space-small)',
            }}
          >
            {/* Search Input */}
            <input
              type="text"
              className="form-control"
              placeholder="Search models..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              role="combobox"
              aria-expanded={filteredModels.length > 0}
              aria-controls="model-list"
            />

            {/* Model List */}
            <div
              id="model-list"
              role="listbox"
              style={{
                border: '1px solid var(--op-color-border)',
                borderRadius: 'var(--op-radius-medium)',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {filteredModels.map((model) => (
                <Button
                  variant="ghost"
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  style={{
                    width: '100%',
                    padding: 'var(--op-space-small)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-small)',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '0',
                    borderBottom: '1px solid var(--op-color-border)',
                    textAlign: 'left',
                    backgroundColor: value === model.id ? 'var(--op-color-neutral-plus-six)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== model.id) {
                      e.currentTarget.style.backgroundColor = 'var(--op-color-neutral-plus-six)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== model.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Image
                    src={model.logo}
                    alt={model.name}
                    width={20}
                    height={20}
                    style={{ objectFit: 'contain', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1 }}>{model.name}</span>
                  {value === model.id && <HugeiconsIcon icon={Tick01Icon} size={20} />}
                </Button>
              ))}
              {filteredModels.length === 0 && (
                <div
                  style={{
                    padding: 'var(--op-space-large)',
                    textAlign: 'center',
                    fontSize: 'var(--op-font-small)',
                  }}
                >
                  No models found
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
