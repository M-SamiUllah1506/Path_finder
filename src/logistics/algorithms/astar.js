import PriorityQueue from '../PriorityQueue';

function heuristic(a, b) {
  // a and b are nodes with lat,lng; use haversine approx
  const toRad = (v) => v * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const aa = Math.sin(dLat/2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
}

export function astar(graph, startId, goalId) {
  const start = graph.getNode(startId);
  const goal = graph.getNode(goalId);
  const gScore = new Map();
  const fScore = new Map();
  const prev = new Map();
  for (const n of graph.nodesArray()) { gScore.set(n.id, Infinity); fScore.set(n.id, Infinity); }
  gScore.set(startId, 0);
  fScore.set(startId, heuristic(start, goal));

  const open = new PriorityQueue();
  open.push(startId, fScore.get(startId));

  while (!open.isEmpty()) {
    const current = open.pop();
    if (current === goalId) break;
    for (const e of graph.neighbors(current)) {
      const tentative = gScore.get(current) + e.weight;
      if (tentative < gScore.get(e.to)) {
        prev.set(e.to, current);
        gScore.set(e.to, tentative);
        const node = graph.getNode(e.to);
        fScore.set(e.to, tentative + heuristic(node, goal));
        open.push(e.to, fScore.get(e.to));
      }
    }
  }

  const path = [];
  if (prev.has(goalId) || startId === goalId) {
    let cur = goalId;
    while (cur !== undefined) {
      path.unshift(cur);
      if (cur === startId) break;
      cur = prev.get(cur);
    }
  }
  return { prev, path };
}
