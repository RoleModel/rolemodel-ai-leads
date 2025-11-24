'use client'

import * as React from 'react'

interface SwitchProps {
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

function Switch({
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchProps) {
  const generatedId = React.useId()
  const switchId = id || generatedId

  return (
    <div className={`switch ${className || ''}`}>
      <input
        type="checkbox"
        id={switchId}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={switchId}></label>
    </div>
  )
}

export { Switch }
