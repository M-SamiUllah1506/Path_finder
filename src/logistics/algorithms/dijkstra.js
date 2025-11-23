import PriorityQueue from '../PriorityQueue';

export function dijkstra(graph, startId, goalId = null) {
  const dist = new Map();
  const prev = new Map();
  for (const n of graph.nodesArray()) dist.set(n.id, Infinity);
  dist.set(startId, 0);

  const pq = new PriorityQueue();
  pq.push(startId, 0);

  while (!pq.isEmpty()) {
    const u = pq.pop();
    if (u === goalId) break;
    for (const e of graph.neighbors(u)) {
      const alt = dist.get(u) + e.weight;
      if (alt < dist.get(e.to)) {
        dist.set(e.to, alt);
        prev.set(e.to, u);
        pq.push(e.to, alt);
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
