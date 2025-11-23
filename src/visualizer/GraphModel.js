class GraphModel {
  constructor() {
    this.nodes = new Map(); // id -> {id,x,y}
    this.adj = new Map(); // id -> [{to, weight}]
    this._nextId = 1;
  }

  addNode(x, y) {
    const id = this._nextId++;
    this.nodes.set(id, { id, x, y });
    this.adj.set(id, []);
    return id;
  }

  addEdge(a, b, weight = null) {
    if (!this.nodes.has(a) || !this.nodes.has(b)) return false;
    const na = this.nodes.get(a);
    const nb = this.nodes.get(b);
    const w = weight === null ? Math.hypot(na.x - nb.x, na.y - nb.y) : weight;
    this.adj.get(a).push({ to: b, weight: w });
    this.adj.get(b).push({ to: a, weight: w });
    return true;
  }

  neighbors(id) {
    return this.adj.get(id) || [];
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  nodesArray() {
    return Array.from(this.nodes.values());
  }

  edgesArray() {
    const out = [];
    for (const [a, list] of this.adj.entries()) {
      for (const e of list) {
        if (String(a) < String(e.to)) out.push({ a: Number(a), b: e.to, weight: e.weight });
      }
    }
    return out;
  }
}

export default GraphModel;
