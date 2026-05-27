// src/lib/graph-utils.ts
// Pure graph computation utilities for the CausalityGraph component.
// Credibility threshold (UI-SPEC): edges.length >= 2 AND at least 1 edge has confidence='high'.
// Node roles: root (no incoming edges) = red, middle (both) = amber, leaf (no outgoing edges) = orange.

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
 * Uses topological depth layout so nodes flow left-to-right by causal order.
 * Root causes (no incoming edges) sit leftmost; leaf effects rightmost.
 */
export function buildGraphData(
  issues: IssueLike[],
  edges: CausalEdgeLike[],
): { nodes: Node[]; edges: Edge[] } {
  const causeIds = new Set(edges.map(e => e.fromIssueId))
  const effectIds = new Set(edges.map(e => e.toIssueId))
  const involvedIds = new Set([...causeIds, ...effectIds])

  const involvedIssues = issues.filter(i => involvedIds.has(i.id))

  // Build parent map for topological depth: nodeId → list of parent nodeIds
  const parents = new Map<string, string[]>()
  for (const issue of involvedIssues) parents.set(issue.id, [])
  for (const edge of edges) parents.get(edge.toIssueId)?.push(edge.fromIssueId)

  // Longest path from any root (with cycle guard)
  const depthCache = new Map<string, number>()
  function computeDepth(id: string, visiting: Set<string>): number {
    if (depthCache.has(id)) return depthCache.get(id)!
    if (visiting.has(id)) return 0
    visiting.add(id)
    const pList = parents.get(id) ?? []
    const d = pList.length === 0
      ? 0
      : Math.max(...pList.map(p => computeDepth(p, new Set(visiting)) + 1))
    depthCache.set(id, d)
    return d
  }
  for (const issue of involvedIssues) computeDepth(issue.id, new Set())

  // Group issues by depth level
  const byDepth = new Map<number, IssueLike[]>()
  for (const issue of involvedIssues) {
    const d = depthCache.get(issue.id) ?? 0
    if (!byDepth.has(d)) byDepth.set(d, [])
    byDepth.get(d)!.push(issue)
  }

  const X_GAP = 250
  const Y_GAP = 130
  const NODE_WIDTH = 200

  const nodes: Node[] = involvedIssues.map(issue => {
    const d = depthCache.get(issue.id) ?? 0
    const group = byDepth.get(d)!
    const idx = group.indexOf(issue)
    const groupHeight = (group.length - 1) * Y_GAP

    const role: 'root' | 'middle' | 'leaf' =
      !effectIds.has(issue.id) ? 'root' :
      !causeIds.has(issue.id) ? 'leaf' : 'middle'

    return {
      id: issue.id,
      type: 'issueNode',
      position: {
        x: d * X_GAP,
        y: idx * Y_GAP - groupHeight / 2,
      },
      data: {
        label: issue.category,
        description: issue.technical_description.slice(0, 110),
        role,
      },
      style: { width: NODE_WIDTH },
    }
  })

  const rfEdges: Edge[] = edges.map(e => ({
    id: e.id,
    source: e.fromIssueId,
    target: e.toIssueId,
    label: e.mechanism.replace(/-/g, ' '),
    labelStyle: { fill: '#94a3b8', fontSize: 10 },
    labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9 },
    labelBgPadding: [4, 3] as [number, number],
    style: { stroke: '#475569', strokeWidth: 1.5 },
    markerEnd: { type: 'arrowclosed' as const, color: '#475569', width: 14, height: 14 },
  }))

  return { nodes, edges: rfEdges }
}
