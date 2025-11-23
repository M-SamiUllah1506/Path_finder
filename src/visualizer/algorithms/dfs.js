export function dfs(graph, startId, goalId = null) {
  const visited = new Set();
  const order = [];
  const parent = new Map();

  function visit(u) {
    visited.add(u);
    order.push(u);
    if (u === goalId) return true;
    for (const e of graph.neighbors(u)) {
      if (!visited.has(e.to)) {
        parent.set(e.to, u);
        const done = visit(e.to);
        if (done) return true;
      }
    }
    return false;
  }

  visit(startId);

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
