// src/lib/graph-utils.ts
// Pure graph computation utilities for the CausalityGraph component.
// Credibility threshold (UI-SPEC): edges.length >= 2 AND at least 1 edge has confidence='high'.
// Node colors (UI-SPEC): cause nodes = red-50/red-600, effect nodes = orange-50/orange-600.

import type { Node, Edge } from '@xyflow/react'

interface CausalEdgeLike {
  id: string
  fromIssueId: string
  toIssueId: string
  confidence: string
  mechanism: string
}

interface IssueLike {
  id: string
  category: string
  technical_description: string
}

/**
 * Returns true when the edge set meets the causality graph credibility threshold:
 * at least 2 edges exist AND at least 1 has confidence='high'.
 */
export function meetsCredibilityThreshold(edges: CausalEdgeLike[]): boolean {
  return edges.length >= 2 && edges.some(e => e.confidence === 'high')
}

/**
 * Converts DB issues and causal edges into React Flow nodes and edges.
 * Only issues that appear as a cause or effect are included.
 * Cause nodes are positioned at x=0; effect nodes at x=320.
 */
export function buildGraphData(
  issues: IssueLike[],
  edges: CausalEdgeLike[],
): { nodes: Node[]; edges: Edge[] } {
  const causeIds = new Set(edges.map(e => e.fromIssueId))
  const effectIds = new Set(edges.map(e => e.toIssueId))

  let causeY = 0
  let effectY = 0

  const nodes: Node[] = issues
    .filter(i => causeIds.has(i.id) || effectIds.has(i.id))
    .map(issue => {
      const isCause = causeIds.has(issue.id)
      const x = isCause ? 0 : 320
      const y = isCause ? (causeY += 120) - 120 : (effectY += 120) - 120
      return {
        id: issue.id,
        position: { x, y },
        data: { label: issue.category },
        style: isCause
          ? { background: '#fef2f2', border: '1px solid #dc2626', color: '#171717' }
          : { background: '#fff7ed', border: '1px solid #ea580c', color: '#171717' },
      }
    })

  const rfEdges: Edge[] = edges.map(e => ({
    id: e.id,
    source: e.fromIssueId,
    target: e.toIssueId,
    label: e.mechanism,
    style: { stroke: '#6b7280' },
  }))

  return { nodes, edges: rfEdges }
}
