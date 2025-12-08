import { Background, ReactFlow, type ReactFlowProps, type Viewport } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { ReactNode } from 'react'

type CanvasProps = ReactFlowProps & {
  children?: ReactNode
  defaultviewport?: number
  colormode?: 'light' | 'dark'
}

const defaultviewport: Viewport = { x: 10, y: 15, zoom: 5 }

export const Canvas = ({ children, ...props }: CanvasProps) => (
  <ReactFlow
    deleteKeyCode={['Backspace', 'Delete']}
    panOnDrag={false}
    panOnScroll
    selectionOnDrag={true}
    zoomOnDoubleClick={false}
    defaultViewport={defaultviewport}
    colorMode={props.colorMode}
    minZoom={0.1}
    {...props}
  >
    <Background bgColor="var(--sidebar)" />
    {children}
  </ReactFlow>
)
