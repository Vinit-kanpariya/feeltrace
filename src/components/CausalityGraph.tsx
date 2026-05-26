'use client'
import { ReactFlow, Background, BackgroundVariant, Controls, MiniMap, type Node, type Edge } from '@xyflow/react'
// Note: stylesheet is in globals.css (D-04), NOT imported here to avoid style duplication and SSR issues.

interface CausalityGraphProps {
  nodes: Node[]
  edges: Edge[]
}

export function CausalityGraph({ nodes, edges }: CausalityGraphProps) {
  return (
    <div className="w-full h-[320px] md:h-[480px]">
      <ReactFlow nodes={nodes} edges={edges} fitView colorMode="light">
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
