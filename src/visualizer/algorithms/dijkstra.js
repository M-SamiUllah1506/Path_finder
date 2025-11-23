export function dijkstra(graph, startId, goalId = null) {
  const dist = new Map();
  const prev = new Map();
  const nodes = graph.nodesArray().map(n => n.id);
  for (const n of nodes) dist.set(n, Infinity);
  dist.set(startId, 0);

  const visited = new Set();

  while (visited.size < nodes.length) {
    let u = null;
    let best = Infinity;
    for (const n of nodes) {
      if (!visited.has(n) && dist.get(n) < best) {
        best = dist.get(n);
        u = n;
      }
    }
    if (u === null) break;
    visited.add(u);
    if (u === goalId) break;
    for (const e of graph.neighbors(u)) {
      const alt = dist.get(u) + e.weight;
      if (alt < dist.get(e.to)) {
        dist.set(e.to, alt);
        prev.set(e.to, u);
      }
    }
  }

  const path = [];
  if (goalId !== null && dist.get(goalId) < Infinity) {
    let cur = goalId;
    while (cur !== undefined) {
      path.unshift(cur);
      if (cur === startId) break;
      cur = prev.get(cur);
    }
  }
  return { dist, prev, path };
}
