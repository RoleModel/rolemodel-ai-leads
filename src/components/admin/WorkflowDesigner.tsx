'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  addEdge,
  reconnectEdge,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Connection,
  MarkerType,
  Background,
  BackgroundVariant,
  type Node as FlowNode,
  type Edge as FlowEdge,
} from '@xyflow/react'
import { Canvas } from "@/components/ai-elements/canvas";
import {
  Node,
  NodeContent,
  NodeDescription,
  NodeHeader,
  NodeTitle,
} from "@/components/ai-elements/node";

import '@xyflow/react/dist/style.css'

// Define custom data type for our nodes
interface NodeData {
  label: string
  description: string
  keywords?: string[]
  color?: string
}

// Edge style options
export type EdgeLineStyle = 'solid' | 'dashed' | 'dotted' | 'animated'

export interface EdgeStyleData {
  stroke: string
  strokeWidth: number
  animated: boolean
  label: string
  lineStyle: EdgeLineStyle
}

// Export types for the controls
export interface WorkflowControls {
  addNode: () => void
  deleteNode: () => void
  deleteEdge: () => void
  updateNode: () => void
  updateEdge: () => void
  saveWorkflow: () => Promise<void>
  selectedNode: FlowNode | null
  selectedEdge: FlowEdge | null
  editMode: boolean
  nodeData: { label: string; description: string; keywords: string }
  setNodeData: React.Dispatch<React.SetStateAction<{ label: string; description: string; keywords: string }>>
  edgeData: EdgeStyleData
  setEdgeData: React.Dispatch<React.SetStateAction<EdgeStyleData>>
  saveStatus: { type: 'success' | 'error' | null; message: string }
}

export interface WorkflowDesignerProps {
  onControlsChange?: (controls: WorkflowControls) => void
}

// Custom node for qualification steps
const QualificationNode = ({ data, isConnectable }: NodeProps) => {
  const nodeData = data as unknown as NodeData
  return (
    <Node handles={{ target: true, source: false }}>
      <NodeHeader>
        <NodeTitle>{nodeData.label}</NodeTitle>
        <NodeDescription>{nodeData.description}</NodeDescription>
      </NodeHeader>
      {nodeData.keywords && nodeData.keywords.length > 0 && (
        <NodeContent>
          <div style={{ fontSize: '10px', color: 'var(--op-color-neutral-on-plus-max)', marginBottom: '4px' }}>
            Keywords:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {nodeData.keywords.map((keyword: string, idx: number) => (
              <span
                key={idx}
                style={{
                  padding: '2px 6px',
                  backgroundColor: 'var(--op-color-primary-background)',
                  borderRadius: '4px',
                  fontSize: '10px',
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </NodeContent>
      )}
      {/* Top handle - target */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        style={{ background: 'var(--op-color-primary-base)' }}
      />
      {/* Bottom handle - source */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        style={{ background: 'var(--op-color-primary-base)' }}
      />
      {/* Left handle - target */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        style={{ background: 'var(--op-color-primary-base)' }}
      />
      {/* Right handle - source */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        style={{ background: 'var(--op-color-primary-base)' }}
      />
    </Node>
  )
}

const nodeTypes = {
  qualification: QualificationNode,
}

// Common label style for edges - positions label on the edge path
const edgeLabelStyle: React.CSSProperties = {
  fontSize: 'var(--op-font-x-small)',
  fontWeight: 500,
}

const edgeLabelBgStyle: React.CSSProperties = {
  fill: 'var(--op-color-neutral-plus-max)',
  fillOpacity: 1,
  stroke: 'var(--op-color-border)',
  strokeWidth: 1,
  rx: 4,
  ry: 4,
}

const initialNodes: FlowNode[] = [
  {
    id: 'start',
    type: 'qualification',
    position: { x: 0, y: 0 },
    data: {
      label: 'Lead Enters Chat',
      description: 'Visitor starts conversation',
      color: 'var(--op-color-primary-base)',
    },
  },
  {
    id: 'q1',
    type: 'qualification',
    position: { x: 160, y: 0 },
    data: {
      label: 'Budget Question',
      description: 'What is your budget?',
      keywords: ['10k', '20k', '50k', 'enterprise'],
      color: 'var(--op-color-alerts-notice-base)',
    },
  },
  {
    id: 'q2',
    type: 'qualification',
    position: { x: 160, y: 220 },
    data: {
      label: 'Timeline Question',
      description: 'When do you need this?',
      keywords: ['urgent', 'asap', 'this quarter'],
      color: 'var(--op-color-notice-background)',
    },
  },
  {
    id: 'q3',
    type: 'qualification',
    position: { x: 400, y: 0 },
    data: {
      label: 'Pain Point Question',
      description: 'What problems are you facing?',
      keywords: ['scaling', 'manual', 'slow', 'errors'],
      color: 'var(--op-color-alerts-notice-base)',
    },
  },
  {
    id: 'score',
    type: 'qualification',
    position: { x: 700, y: 350 },
    data: {
      label: 'Calculate Score',
      description: 'Evaluate lead qualification',
      color: 'var(--op-color-alerts-warning-base)',
    },
  },
  {
    id: 'qualified',
    type: 'qualification',
    position: { x: 250, y: 450 },
    data: {
      label: 'Qualified Lead',
      description: 'Send to sales team',
      color: 'var(--op-color-alerts-success-base)',
    },
  },
  {
    id: 'nurture',
    type: 'qualification',
    position: { x: 550, y: 450 },
    data: {
      label: 'Nurture Lead',
      description: 'Add to email sequence',
      color: 'var(--op-color-alerts-danger-base)',
    },
  },
]

const initialEdges: FlowEdge[] = [
  {
    id: 'e-start-q1',
    source: 'start',
    target: 'q1',
    animated: true,
    style: { stroke: 'var(--op-color-primary-base)' },
  },
  {
    id: 'e-start-q2',
    source: 'start',
    target: 'q2',
    animated: true,
    style: { stroke: 'var(--op-color-primary-base)' },
  },
  {
    id: 'e-q1-q3',
    source: 'q1',
    target: 'q3',
    style: { stroke: 'var(--op-color-primary-base)' },
  },
  {
    id: 'e-q2-q3',
    source: 'q2',
    target: 'q3',
    style: { stroke: 'var(--op-color-primary-base)' },
  },
  {
    id: 'e-q3-score',
    source: 'q3',
    target: 'score',
    animated: true,
    style: { stroke: 'var(--op-color-primary-base)' },
  },
  {
    id: 'e-score-qualified',
    source: 'score',
    target: 'qualified',
    label: 'Score > 70%',
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [4, 8] as [number, number],
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'var(--op-color-alerts-success-base)' },
  },
  {
    id: 'e-score-nurture',
    source: 'score',
    target: 'nurture',
    label: 'Score < 70%',
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [4, 8] as [number, number],
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'var(--op-color-error)' },
  },
]

export function WorkflowDesigner({ onControlsChange }: WorkflowDesignerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<FlowEdge | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [nodeData, setNodeData] = useState({
    label: '',
    description: '',
    keywords: '',
  })
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  })
  const [edgeData, setEdgeData] = useState<EdgeStyleData>({
    stroke: 'var(--op-color-primary-base)',
    strokeWidth: 2,
    animated: true,
    label: '',
    lineStyle: 'animated',
  })

  // Load saved workflow on mount
  useEffect(() => {
    async function loadWorkflow() {
      try {
        const response = await fetch('/api/workflow')
        if (response.ok) {
          const data = await response.json()
          if (data.workflow?.workflow?.nodes) {
            const savedNodes = data.workflow.workflow.nodes.map((node: { id: string; position?: { x: number; y: number }; data?: { label?: string; description?: string; question?: string; keywords?: string[] } }) => ({
              id: node.id,
              type: 'qualification',
              position: node.position || { x: 0, y: 0 },
              data: {
                label: node.data?.label || node.id,
                description: node.data?.description || node.data?.question || '',
                keywords: node.data?.keywords || [],
              }
            }))
            const savedEdges = data.workflow.workflow.edges || []
            if (savedNodes.length > 0) {
              setNodes(savedNodes)
              setEdges(savedEdges)
            }
          }
        }
      } catch (error) {
        console.error('Error loading workflow:', error)
      }
    }
    loadWorkflow()
  }, [setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true,
      }
      setEdges((eds: FlowEdge[]) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const onReconnect = useCallback(
    (oldEdge: FlowEdge, newConnection: Connection) => {
      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: FlowNode) => {
    const data = node.data as unknown as NodeData
    setSelectedNode(node)
    setSelectedEdge(null)
    setNodeData({
      label: data.label || '',
      description: data.description || '',
      keywords: data.keywords ? data.keywords.join(', ') : '',
    })
    setEditMode(true)
  }, [])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: FlowEdge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
    setEditMode(false)
    // Populate edge data from selected edge
    // Determine line style from edge properties
    let lineStyle: EdgeLineStyle = 'solid'
    if (edge.animated) {
      lineStyle = 'animated'
    } else if (edge.style?.strokeDasharray === '5 5') {
      lineStyle = 'dashed'
    } else if (edge.style?.strokeDasharray === '2 2') {
      lineStyle = 'dotted'
    }
    setEdgeData({
      stroke: (edge.style?.stroke as string) || 'var(--op-color-primary-base)',
      strokeWidth: (edge.style?.strokeWidth as number) || 2,
      animated: edge.animated || false,
      label: (edge.label as string) || '',
      lineStyle,
    })
  }, [])

  const deleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds: FlowEdge[]) => eds.filter((edge: FlowEdge) => edge.id !== selectedEdge.id))
      setSelectedEdge(null)
    }
  }, [selectedEdge, setEdges])

  const updateEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds: FlowEdge[]) =>
        eds.map((edge: FlowEdge) => {
          if (edge.id === selectedEdge.id) {
            // Determine strokeDasharray based on lineStyle
            let strokeDasharray: string | undefined
            let animated = false
            switch (edgeData.lineStyle) {
              case 'animated':
                animated = true
                break
              case 'dashed':
                strokeDasharray = '5 5'
                break
              case 'dotted':
                strokeDasharray = '2 2'
                break
              default:
                // solid - no dash array
                break
            }
            return {
              ...edge,
              animated,
              label: edgeData.label || undefined,
              labelStyle: edgeData.label ? edgeLabelStyle : undefined,
              labelBgStyle: edgeData.label ? edgeLabelBgStyle : undefined,
              labelBgPadding: edgeData.label ? [4, 8] as [number, number] : undefined,
              style: {
                ...edge.style,
                stroke: edgeData.stroke,
                strokeWidth: edgeData.strokeWidth,
                strokeDasharray,
              },
            }
          }
          return edge
        })
      )
    }
  }, [selectedEdge, edgeData, setEdges])

  const addNode = useCallback(() => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: 'qualification',
      position: {
        x: 400,
        y: 200,
      },
      data: {
        label: 'New Question',
        description: 'Click to edit',
        color: 'var(--op-color-neutral-plus-seven)',
      },
    }
    setNodes((nds: FlowNode[]) => [...nds, newNode])
  }, [setNodes])

  const updateNode = useCallback(() => {
    if (selectedNode && editMode) {
      setNodes((nds: FlowNode[]) =>
        nds.map((node: FlowNode) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: nodeData.label,
                description: nodeData.description,
                keywords: nodeData.keywords ? nodeData.keywords.split(',').map(k => k.trim()) : [],
              },
            }
          }
          return node
        })
      )
      setEditMode(false)
    }
  }, [selectedNode, editMode, nodeData, setNodes])

  const deleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds: FlowNode[]) => nds.filter((node: FlowNode) => node.id !== selectedNode.id))
      setEdges((eds: FlowEdge[]) => eds.filter((edge: FlowEdge) =>
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ))
      setSelectedNode(null)
      setEditMode(false)
    }
  }, [selectedNode, setNodes, setEdges])

  const saveWorkflow = useCallback(async () => {
    try {
      const workflow = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.id.includes('q') ? 'question' :
            node.id === 'start' ? 'entry' :
              node.id.includes('qualified') || node.id.includes('nurture') ? 'outcome' : 'step',
          position: node.position,
          data: {
            ...node.data,
            question: (node.data as unknown as NodeData).description,
            weight: node.id.includes('q1') ? 30 :
              node.id.includes('q2') ? 25 :
                node.id.includes('q3') ? 20 : 25,
          }
        })),
        edges,
        qualificationThreshold: 70
      }

      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || 'Failed to save')
      }

      setSaveStatus({ type: 'success', message: 'Workflow saved! The bot will now use these questions to qualify leads.' })
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 4000)
    } catch (error) {
      console.error('Error saving workflow:', error)
      const message = error instanceof Error ? error.message : 'Failed to save workflow'
      setSaveStatus({ type: 'error', message })
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 4000)
    }
  }, [nodes, edges])

  // Pass controls to parent via callback whenever they change
  useEffect(() => {
    onControlsChange?.({
      addNode,
      deleteNode,
      deleteEdge,
      updateNode,
      updateEdge,
      saveWorkflow,
      selectedNode,
      selectedEdge,
      editMode,
      nodeData,
      setNodeData,
      edgeData,
      setEdgeData,
      saveStatus,
    })
  }, [onControlsChange, addNode, deleteNode, deleteEdge, updateNode, updateEdge, saveWorkflow, selectedNode, selectedEdge, editMode, nodeData, edgeData, saveStatus])

  return (
    <div style={{ width: '100%', height: 'calc(100vh + 20px)', position: 'relative', backgroundColor: 'var(--op-color-neutral-plus-six)' }}>
      <Canvas
        defaultViewport={{ x: 20, y: 40, zoom: 1.3 }}
        colorMode="light"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        edgesReconnectable
        nodeTypes={nodeTypes}
        fitView={false}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} color={'var(--op-color-border)'} gap={5} size={1} />
        <Controls />
      </Canvas>
    </div>
  )
}
