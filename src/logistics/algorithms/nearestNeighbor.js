// Simple nearest-neighbor TSP heuristic: start at startId, greedily pick nearest unvisited
export function nearestNeighbor(graph, startId) {
  const nodes = graph.nodesArray().map(n => n.id);
  const visited = new Set([startId]);
  const path = [startId];
  let cur = startId;
  while (visited.size < nodes.length) {
    let best = null; let bestd = Infinity;
    for (const n of nodes) {
      if (visited.has(n)) continue;
      for (const e of graph.neighbors(cur)) {
        if (e.to === n && e.weight < bestd) { bestd = e.weight; best = n; }
      }
    }
    if (best === null) break;
    path.push(best); visited.add(best); cur = best;
  }
  return path;
}
