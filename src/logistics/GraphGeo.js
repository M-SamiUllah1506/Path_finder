// Graph model using geographical coordinates (lat, lng)
class GraphGeo {
  constructor() {
    this.nodes = new Map(); // id -> {id, lat, lng}
    this.adj = new Map(); // id -> [{to, weight}]
    this._nextId = 1;
  }

  addNode(lat, lng) {
    const id = this._nextId++;
    this.nodes.set(id, { id, lat, lng });
    this.adj.set(id, []);
    return id;
  }

  addEdge(a, b, weight = null) {
    if (!this.nodes.has(a) || !this.nodes.has(b)) return false;
    const na = this.nodes.get(a);
    const nb = this.nodes.get(b);
    const w = weight === null ? haversine(na.lat, na.lng, nb.lat, nb.lng) : weight;
    this.adj.get(a).push({ to: b, weight: w });
    this.adj.get(b).push({ to: a, weight: w });
    return true;
  }

  removeEdge(a, b) {
    if (!this.adj.has(a) || !this.adj.has(b)) return false;
    this.adj.set(a, this.adj.get(a).filter(e => e.to !== b));
    this.adj.set(b, this.adj.get(b).filter(e => e.to !== a));
    return true;
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    // remove edges to this node
    for (const [k, list] of this.adj.entries()) {
      this.adj.set(k, list.filter(e => e.to !== id));
    }
    this.adj.delete(id);
    this.nodes.delete(id);
    return true;
  }

  neighbors(id) { return this.adj.get(id) || []; }
  getNode(id) { return this.nodes.get(id); }
  nodesArray() { return Array.from(this.nodes.values()); }
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

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (v) => v * Math.PI / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default GraphGeo;
export { haversine };
