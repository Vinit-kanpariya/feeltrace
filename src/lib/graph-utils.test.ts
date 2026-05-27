// src/lib/graph-utils.test.ts
// RED test stubs for Phase 4 Wave 0 — contracts for graph utility functions.
// These tests WILL fail until src/lib/graph-utils.ts is created in Wave 1 (Plan 04-03).
// Covers: DASH-03

import { describe, it, expect } from 'vitest'
import { meetsCredibilityThreshold, buildGraphData } from './graph-utils'

// Minimal CausalEdge-shaped objects — no DB or Prisma dependencies in tests
interface TestEdge {
  id: string
  fromIssueId: string
  toIssueId: string
  confidence: string
  mechanism: string
}

interface TestIssue {
  id: string
  category: string
  technical_description: string
  severity: number
}

describe('meetsCredibilityThreshold', () => {
  it('returns false for empty edge array', () => {
    expect(meetsCredibilityThreshold([])).toBe(false)
  })

  it('returns false when only 1 edge exists (needs >= 2)', () => {
    const edges: TestEdge[] = [
      { id: 'e1', fromIssueId: 'i1', toIssueId: 'i2', confidence: 'high', mechanism: 'layout-shift' },
    ]
    expect(meetsCredibilityThreshold(edges)).toBe(false)
  })

  it('returns false when 2 edges exist but none are high confidence', () => {
    const edges: TestEdge[] = [
      { id: 'e1', fromIssueId: 'i1', toIssueId: 'i2', confidence: 'low', mechanism: 'layout-shift' },
      { id: 'e2', fromIssueId: 'i2', toIssueId: 'i3', confidence: 'low', mechanism: 'render-blocking' },
    ]
    expect(meetsCredibilityThreshold(edges)).toBe(false)
  })

  it('returns true when >= 2 edges exist and at least 1 is high confidence', () => {
    const edges: TestEdge[] = [
      { id: 'e1', fromIssueId: 'i1', toIssueId: 'i2', confidence: 'high', mechanism: 'layout-shift' },
      { id: 'e2', fromIssueId: 'i2', toIssueId: 'i3', confidence: 'low', mechanism: 'render-blocking' },
    ]
    expect(meetsCredibilityThreshold(edges)).toBe(true)
  })
})

describe('buildGraphData', () => {
  it('produces 2 nodes for 2 issues and 1 edge', () => {
    const issues: TestIssue[] = [
      { id: 'issue-1', category: 'perceived-perf', technical_description: 'Slow LCP', severity: 3 },
      { id: 'issue-2', category: 'technical-perf', technical_description: 'Blocking scripts', severity: 2 },
    ]
    const edges: TestEdge[] = [
      { id: 'edge-1', fromIssueId: 'issue-1', toIssueId: 'issue-2', confidence: 'high', mechanism: 'render-blocking' },
    ]
    const { nodes, edges: rfEdges } = buildGraphData(issues, edges)
    expect(nodes).toHaveLength(2)
    expect(rfEdges).toHaveLength(1)
  })

  it('places root node at depth 0 (x=0) and effect node at depth 1 (x=250)', () => {
    const issues: TestIssue[] = [
      { id: 'issue-1', category: 'perceived-perf', technical_description: 'Slow LCP', severity: 3 },
      { id: 'issue-2', category: 'technical-perf', technical_description: 'Blocking scripts', severity: 2 },
    ]
    const edges: TestEdge[] = [
      { id: 'edge-1', fromIssueId: 'issue-1', toIssueId: 'issue-2', confidence: 'high', mechanism: 'render-blocking' },
    ]
    const { nodes } = buildGraphData(issues, edges)
    const rootNode = nodes.find(n => n.id === 'issue-1')
    const leafNode = nodes.find(n => n.id === 'issue-2')
    expect(rootNode?.position.x).toBe(0)   // depth 0 → x = 0 * 250
    expect(leafNode?.position.x).toBe(250)  // depth 1 → x = 1 * 250
  })

  it('sets edge label to the mechanism with hyphens replaced by spaces', () => {
    const issues: TestIssue[] = [
      { id: 'issue-1', category: 'perceived-perf', technical_description: 'Slow LCP', severity: 3 },
      { id: 'issue-2', category: 'technical-perf', technical_description: 'Blocking scripts', severity: 2 },
    ]
    const edges: TestEdge[] = [
      { id: 'edge-1', fromIssueId: 'issue-1', toIssueId: 'issue-2', confidence: 'high', mechanism: 'render-blocking' },
    ]
    const { edges: rfEdges } = buildGraphData(issues, edges)
    expect(rfEdges[0].label).toBe('render blocking')
  })
})
