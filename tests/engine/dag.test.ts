// ──────────────────────────────────────────────
// DAG test — cycle detection + stable topo order
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { topologicalSort, type DAGNode } from '../../src/lib/engine/graph';

/** Minimal test node */
function makeNode(id: string, deps: string[] = []): DAGNode {
  return {
    id,
    dependencies: deps,
    prepare: () => {},
    apply: () => {},
  };
}

describe('DAG Topological Sort', () => {
  it('sorts independent nodes deterministically (alphabetical)', () => {
    const nodes = [makeNode('c'), makeNode('a'), makeNode('b')];
    const sorted = topologicalSort(nodes);
    expect(sorted.map(n => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('respects dependency ordering', () => {
    const nodes = [
      makeNode('expense', ['income']),
      makeNode('income'),
      makeNode('debt', ['income', 'expense']),
    ];
    const sorted = topologicalSort(nodes);
    const order = sorted.map(n => n.id);

    expect(order.indexOf('income')).toBeLessThan(order.indexOf('expense'));
    expect(order.indexOf('expense')).toBeLessThan(order.indexOf('debt'));
  });

  it('throws on cycle', () => {
    const nodes = [
      makeNode('a', ['b']),
      makeNode('b', ['a']),
    ];
    expect(() => topologicalSort(nodes)).toThrow('cycle detected');
  });

  it('throws on unknown dependency', () => {
    const nodes = [
      makeNode('a', ['nonexistent']),
    ];
    expect(() => topologicalSort(nodes)).toThrow('unknown node');
  });

  it('handles diamond dependency graph', () => {
    const nodes = [
      makeNode('a'),
      makeNode('b', ['a']),
      makeNode('c', ['a']),
      makeNode('d', ['b', 'c']),
    ];
    const sorted = topologicalSort(nodes);
    const order = sorted.map(n => n.id);

    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'));
    expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'));
  });

  it('produces stable order across multiple calls', () => {
    const nodes = [
      makeNode('c', ['a']),
      makeNode('b'),
      makeNode('a'),
      makeNode('d', ['b', 'c']),
    ];

    const order1 = topologicalSort(nodes).map(n => n.id);
    const order2 = topologicalSort(nodes).map(n => n.id);
    const order3 = topologicalSort(nodes).map(n => n.id);

    expect(order1).toEqual(order2);
    expect(order2).toEqual(order3);
  });
});
