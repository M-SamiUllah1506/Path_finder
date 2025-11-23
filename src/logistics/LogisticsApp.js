import React, { useRef, useState } from 'react';
import GraphGeo, { haversine } from './GraphGeo';
import MapPanel from './MapPanel';
import Controls from './Controls';
import { dijkstra } from './algorithms/dijkstra';
import { astar } from './algorithms/astar';
import { nearestNeighbor } from './algorithms/nearestNeighbor';
import './Logistics.css';

export default function LogisticsApp({ defaultCenter = [40.7128, -74.0060] }) {
  const graphRef = useRef(null);
  if (!graphRef.current) graphRef.current = new GraphGeo();
  const graph = graphRef.current;

  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    // add Pakistan major cities as sample nodes
    // Karachi, Lahore, Islamabad, Peshawar, Quetta, Multan, Faisalabad
    const karachi = graph.addNode(24.8607, 67.0011);
    const lahore = graph.addNode(31.5204, 74.3587);
    const islamabad = graph.addNode(33.6844, 73.0479);
    const peshawar = graph.addNode(34.0151, 71.5249);
    const quetta = graph.addNode(30.1798, 66.9750);
    const multan = graph.addNode(30.1575, 71.5249);
    const faisalabad = graph.addNode(31.4504, 73.1350);
    // add some initial edges between major cities (not exhaustive)
    graph.addEdge(karachi, multan);
    graph.addEdge(multan, lahore);
    graph.addEdge(lahore, faisalabad);
    graph.addEdge(lahore, islamabad);
    graph.addEdge(islamabad, peshawar);
    graph.addEdge(karachi, quetta);
    graph.addEdge(quetta, multan);
    graph.addEdge(faisalabad, islamabad);
  }

  const [selected, setSelected] = useState([]);
  const [start, setStart] = useState(null);
  const [goal, setGoal] = useState(null);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [route, setRoute] = useState([]);
  const [stats, setStats] = useState({ distance: 0 });
  const [vehiclePos, setVehiclePos] = useState(null);
  const [vehicleAngle, setVehicleAngle] = useState(0);
  const [speed, setSpeed] = useState(400);
  const [reachedNodes, setReachedNodes] = useState(new Set());
  const [connectMode, setConnectMode] = useState(false);
  const [connectStart, setConnectStart] = useState(null);
  const [, setHistory] = useState([]);
  const [connectedNodes, setConnectedNodes] = useState(new Set());
  const [routeSequence, setRouteSequence] = useState([]);
  const animRef = useRef({ running: false, cancel: false });

  const onMapClick = ({ lat, lng }) => {
    const id = graph.addNode(lat, lng);
    setSelected([id]);
    // record history for undo
    setHistory(h => [...h, { type: 'addNode', id }]);
  };

  const onSelectNode = (id) => {
    // If connect mode is active, use clicks to create an edge between two nodes
    if (connectMode) {
      if (!connectStart) {
        setConnectStart(id);
        setSelected([id]);
      } else {
        if (connectStart !== id) {
          graph.addEdge(connectStart, id);
          // record history and connected nodes
          setHistory(h => [...h, { type: 'addEdge', a: connectStart, b: id }]);
          setConnectedNodes(s => new Set(s).add(connectStart).add(id));
        }
        setConnectStart(null);
        setSelected([]);
      }
      return;
    }
    // normal selection behavior
    setSelected((s) => {
      const idx = s.indexOf(id);
      if (idx >= 0) {
        const copy = s.slice(); copy.splice(idx, 1); return copy;
      }
      return [...s.slice(-1), id];
    });
  };

  const addEdgeBetween = () => {
    if (selected.length >= 2) {
      const a = selected[selected.length - 2];
      const b = selected[selected.length - 1];
      graph.addEdge(a,b);
      setSelected([]);
      setHistory(h => [...h, { type: 'addEdge', a, b }]);
      setConnectedNodes(s => { const copy = new Set(s); copy.add(a); copy.add(b); return copy; });
    }
  };

  // Add currently selected node to route sequence (for custom route building)
  const addToRouteSequence = () => {
    if (selected.length === 0) return;
    const id = selected[selected.length - 1];
    setRouteSequence(seq => [...seq, id]);
  };

  const clearRouteSequence = () => setRouteSequence([]);

  const undoLast = () => {
    setHistory(h => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      // apply reverse
      if (last.type === 'addNode') {
        graph.removeNode(last.id);
        // also remove from connectedNodes and routeSequence if present
        setConnectedNodes(s => { const copy = new Set(s); copy.delete(last.id); return copy; });
        setRouteSequence(seq => seq.filter(x => x !== last.id));
      } else if (last.type === 'addEdge') {
        graph.removeEdge(last.a, last.b);
        setConnectedNodes(s => { const copy = new Set(s); copy.delete(last.a); copy.delete(last.b); return copy; });
      }
      return h.slice(0, -1);
    });
    // also clear selected
    setSelected([]);
  };

  // expose global handlers used by Controls buttons
  window.__undo = undoLast;
  window.__addToRoute = addToRouteSequence;
  window.__clearRoute = clearRouteSequence;

  const onCompute = () => {
    // prefer an explicit selected pair: when user clicks two nodes on the map
    const useStart = (selected && selected.length >= 1) ? selected[0] : start;
    const useGoal = (selected && selected.length >= 2) ? selected[1] : goal;
    if (!useStart) return;
    // if user built a custom route sequence, use it directly
    if (routeSequence && routeSequence.length > 0) {
      setRoute(routeSequence.slice());
      // compute distance for sequence
      let dist = 0;
      for (let i = 0; i + 1 < routeSequence.length; i++) {
        const a = graph.getNode(routeSequence[i]);
        const b = graph.getNode(routeSequence[i+1]);
        dist += haversine(a.lat, a.lng, b.lat, b.lng);
      }
      setStats({ distance: dist });
      return;
    }
    if (algorithm === 'dijkstra') {
      // if a goal is provided, compute shortest path between start and goal
      if (useGoal !== null && useGoal !== undefined && useGoal !== '') {
        const res = dijkstra(graph, useStart, useGoal);
        setRoute(res.path || []);
        setStats({ distance: res.path && res.path.length > 1 ? res.dist.get(useGoal) : 0 });
      } else {
        // otherwise compute dijkstra from start and pick nearest other node
        const res = dijkstra(graph, useStart, null);
        let best = null; let bestd = Infinity;
        for (const [id, d] of res.dist.entries()) {
          if (id === useStart) continue;
          if (d < bestd) { bestd = d; best = id; }
        }
        const path = [];
        if (best) {
          let cur = best;
          while (cur !== undefined) {
            path.unshift(cur);
            if (cur === useStart) break;
            cur = res.prev.get(cur);
          }
        }
        setRoute(path);
        setStats({ distance: bestd });
      }
    } else if (algorithm === 'astar') {
      // if a specific goal (selected or dropdown) is provided, run A*
      if (useGoal !== null && useGoal !== undefined && useGoal !== '') {
        const res = astar(graph, useStart, useGoal);
        setRoute(res.path || []);
        let dist = 0; for (let i=0;i+1<res.path.length;i++) { const a = graph.getNode(res.path[i]); const b = graph.getNode(res.path[i+1]); dist += haversine(a.lat,a.lng,b.lat,b.lng); }
        setStats({ distance: dist });
      } else {
        // no explicit goal: pick nearest other node as before
        const nodes = graph.nodesArray().map(n => n.id).filter(id => id !== useStart);
        if (!nodes.length) return;
        const computedGoal = nodes[0];
        const res = astar(graph, useStart, computedGoal);
        setRoute(res.path || []);
        let dist = 0; for (let i=0;i+1<res.path.length;i++) { const a = graph.getNode(res.path[i]); const b = graph.getNode(res.path[i+1]); dist += haversine(a.lat,a.lng,b.lat,b.lng); }
        setStats({ distance: dist });
      }
    } else if (algorithm === 'nn') {
      const path = nearestNeighbor(graph, useStart);
      let dist = 0; for (let i=0;i+1<path.length;i++) { const a = graph.getNode(path[i]); const b = graph.getNode(path[i+1]); dist += haversine(a.lat,a.lng,b.lat,b.lng); }
      setRoute(path);
      setStats({ distance: dist });
    }
  };

  function computeAngle(a, b) {
    const dy = b.lat - a.lat;
    const dx = b.lng - a.lng;
    const rad = Math.atan2(dy, dx);
    return rad * 180 / Math.PI;
  }

  const animateRoute = async () => {
    if (!route || route.length < 2) return;
    animRef.current.running = true;
    animRef.current.cancel = false;
    // move along each segment with interpolation
    for (let i = 0; i + 1 < route.length; i++) {
      if (animRef.current.cancel) break;
      const a = graph.getNode(route[i]);
      const b = graph.getNode(route[i+1]);
      const steps = Math.max(12, Math.floor(1000 / (speed || 200)));
      const startAngle = computeAngle(a,b);
      const endAngle = startAngle; // heading remains same per segment; we interpolate smoothly
      for (let s = 0; s <= steps; s++) {
        if (animRef.current.cancel) break;
        const t = s / steps;
        const lat = a.lat + (b.lat - a.lat) * t;
        const lng = a.lng + (b.lng - a.lng) * t;
        const ang = lerpAngle(startAngle, endAngle, t);
        setVehiclePos({ lat, lng });
        setVehicleAngle(ang);
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, Math.max(20, speed / steps)));
      }
      // arrived at node b
      setReachedNodes((prev) => new Set(prev).add(route[i+1]));
    }
    animRef.current.running = false;
  };

  const stepOnce = () => {
    if (!route || route.length < 2) return;
    // find current index, move to next node
    const cur = vehiclePos ? route.reduce((acc, id, idx) => {
      const n = graph.getNode(id);
      const d = Math.hypot(n.lat - vehiclePos.lat, n.lng - vehiclePos.lng);
      return d < acc.d ? { d, idx } : acc;
    }, { d: Infinity, idx: 0 }).idx : 0;
    const nextIdx = Math.min(route.length - 1, cur + 1);
    const next = graph.getNode(route[nextIdx]);
    setVehiclePos({ lat: next.lat, lng: next.lng });
    if (nextIdx > 0) {
      const prev = graph.getNode(route[nextIdx - 1]);
      setVehicleAngle(computeAngle(prev, next));
    }
  };

  const resetVehicle = () => { animRef.current.cancel = true; animRef.current.running = false; setVehiclePos(null); setVehicleAngle(0); };

  function lerpAngle(a, b, t) {
    // normalize
    const diff = ((((b - a) % 360) + 540) % 360) - 180;
    return a + diff * t;
  }

  return (
    <div className="logistics-root">
      <div className="logistics-left">
        <MapPanel graph={graph} center={defaultCenter} onMapClick={onMapClick} route={route} selected={selected} vehiclePosition={vehiclePos} vehicleAngle={vehicleAngle} onSelectNode={onSelectNode} reached={reachedNodes} connected={connectedNodes} />
      </div>
      <div className="logistics-right">
        <Controls graph={graph} algorithm={algorithm} setAlgorithm={setAlgorithm} start={start} setStart={setStart} goal={goal} setGoal={setGoal} onCompute={onCompute} addEdgeBetween={() => addEdgeBetween()} selected={selected} onAnimate={() => animateRoute()} onStep={() => stepOnce()} onReset={() => resetVehicle()} speed={speed} setSpeed={(v) => setSpeed(v)} connectMode={connectMode} setConnectMode={setConnectMode} connectStart={connectStart} />
        <div className="stats">
          <div><strong>Route distance (km):</strong> {stats.distance ? stats.distance.toFixed(2) : '—'}</div>
          <div><strong>Nodes:</strong> {graph.nodesArray().length}</div>
          <div><strong>Edges:</strong> {graph.edgesArray().length}</div>
          <div><strong>Animating:</strong> {animRef.current.running ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
}
