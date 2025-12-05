interface SpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const sizeMap = {
  small: 'calc(var(--op-size-unit) * 4)',
  medium: 'calc(var(--op-size-unit) * 6)',
  large: 'calc(var(--op-size-unit) * 8)',
}

const borderWidthMap = {
  small: 'var(--op-border-width-large)',
  medium: '3px',
  large: 'var(--op-border-width-x-large)',
}

export function Spinner({ size = 'medium', className = '' }: SpinnerProps) {
  const dimension = sizeMap[size]
  const borderWidth = borderWidthMap[size]

  return (
    <div
      className={`spinner ${className}`}
      style={{
        position: 'relative',
        width: dimension,
        height: dimension,
      }}
      role="status"
      aria-label="Loading"
    >
      <div
        className="spinner__track"
        style={{
          position: 'absolute',
          inset: 0,
          border: `${borderWidth} solid var(--op-color-neutral-plus-four)`,
          borderRadius: '50%',
        }}
      />
      <div
        className="spinner__bar animate-spin"
        style={{
          position: 'absolute',
          inset: 0,
          border: `${borderWidth} solid var(--op-color-primary-base)`,
          borderRadius: '50%',
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
        }}
      />
    </div>
  )
}
