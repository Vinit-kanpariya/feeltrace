'use client'
import { memo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react'

// Note: stylesheet is in globals.css (D-04), NOT imported here to avoid style duplication and SSR issues.

interface IssueNodeData {
  label: string
  description: string
  role: 'root' | 'middle' | 'leaf'
  [key: string]: unknown
}

// role → border + label colours
const ROLE_STYLE = {
  root:   { border: '#ef4444', label: '#f87171' }, // red — root cause
  middle: { border: '#f59e0b', label: '#fbbf24' }, // amber — intermediate
  leaf:   { border: '#f97316', label: '#fb923c' }, // orange — downstream effect
}

const IssueNode = memo(function IssueNode({ data }: { data: IssueNodeData }) {
  const { border, label: labelColor } = ROLE_STYLE[data.role] ?? ROLE_STYLE.middle

  return (
    <div
      style={{ border: `1px solid ${border}`, width: 200 }}
      className="px-3 py-2.5 rounded-lg bg-slate-800 text-left"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#475569', border: '1px solid #64748b', width: 8, height: 8 }}
      />
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 leading-none" style={{ color: labelColor }}>
        {data.label.replace(/-/g, ' ')}
      </p>
      <p className="text-[11px] text-slate-400 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {data.description}
      </p>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#475569', border: '1px solid #64748b', width: 8, height: 8 }}
      />
    </div>
  )
})

const nodeTypes: NodeTypes = { issueNode: IssueNode }

interface CausalityGraphProps {
  nodes: Node[]
  edges: Edge[]
}

export function CausalityGraph({ nodes, edges }: CausalityGraphProps) {
  return (
    <div className="w-full h-[380px] md:h-[480px] rounded-xl overflow-hidden border border-slate-700/60">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        colorMode="dark"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll={false}
      >
        <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
