export function bfs(graph, startId, goalId = null) {
  const visited = new Set();
  const q = [];
  const parent = new Map();
  const order = [];
  q.push(startId);
  visited.add(startId);
  while (q.length) {
    const u = q.shift();
    order.push(u);
    if (u === goalId) break;
    for (const e of graph.neighbors(u)) {
      if (!visited.has(e.to)) {
        visited.add(e.to);
        parent.set(e.to, u);
        q.push(e.to);
      }
    }
  }
  // reconstruct path
  const path = [];
  if (goalId !== null && visited.has(goalId)) {
    let cur = goalId;
    while (cur !== undefined) {
      path.unshift(cur);
      if (cur === startId) break;
      cur = parent.get(cur);
    }
  }
  return { order, parent, path };
}
