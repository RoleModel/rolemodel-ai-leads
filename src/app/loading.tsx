import { Spinner } from '@/components/ui/Spinner'

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: '200px',
      }}
    >
      <Spinner size="large" />
    </div>
  )
}
