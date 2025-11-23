import React, { useMemo, useState, useRef } from 'react';
import GraphModel from './GraphModel';
import GraphView from './GraphView';
import Controls from './Controls';
import { bfs } from './algorithms/bfs';
import { dfs } from './algorithms/dfs';
import { dijkstra } from './algorithms/dijkstra';
import './Visualizer.css';

export default function Visualizer({ registerClear }) {
  const graphRef = useRef(null);
  if (!graphRef.current) graphRef.current = new GraphModel();
  const graph = graphRef.current;

  // sample initial nodes
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    const n1 = graph.addNode(100, 80);
    const n2 = graph.addNode(260, 60);
    const n3 = graph.addNode(220, 180);
    const n4 = graph.addNode(80, 200);
    graph.addEdge(n1, n2);
    graph.addEdge(n2, n3);
    graph.addEdge(n3, n4);
    graph.addEdge(n4, n1);
    graph.addEdge(n1, n3);
  }

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [algorithm, setAlgorithm] = useState('bfs');
  const [start, setStart] = useState(null);
  const [goal, setGoal] = useState('');
  const [order, setOrder] = useState([]);
  const [path, setPath] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [speed, setSpeed] = useState(400);

  const highlighted = useMemo(() => new Set(), []);

  const onAddNode = (x, y) => {
    const id = graph.addNode(x, y);
    setSelectedNodes([id]);
  };

  const onSelectNode = (id) => {
    setSelectedNodes((s) => {
      if (s.includes(id)) return s.filter(x => x !== id);
      return [...s, id];
    });
  };

  const addEdgeBetweenSelected = () => {
    if (selectedNodes.length >= 2) {
      graph.addEdge(selectedNodes[selectedNodes.length - 2], selectedNodes[selectedNodes.length - 1]);
      setSelectedNodes([]);
    }
  };

  const onRun = async () => {
    if (!start) return;
    setOrder([]); setPath([]);
    setAnimating(true);
    let res;
    if (algorithm === 'bfs') res = bfs(graph, start, goal || null);
    else if (algorithm === 'dfs') res = dfs(graph, start, goal || null);
    else if (algorithm === 'dijkstra') res = dijkstra(graph, start, goal || null);

    // animate order
    for (let i = 0; i < res.order.length; i++) {
      setOrder(res.order.slice(0, i + 1));
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, speed));
    }
    setPath(res.path || []);
    setAnimating(false);
  };

  const onStep = () => {
    // simple single-step: run one more visited node
    if (!start) return;
    const res = algorithm === 'bfs' ? bfs(graph, start, goal || null) : algorithm === 'dfs' ? dfs(graph, start, goal || null) : dijkstra(graph, start, goal || null);
    const cur = order.length;
    if (cur < res.order.length) setOrder(res.order.slice(0, cur + 1));
    if (res.path) setPath(res.path);
  };

  const onReset = () => { setOrder([]); setPath([]); setAnimating(false); };

  // pairwise distances between selected nodes
  const [pairDistances, setPairDistances] = useState([]);
  const [selectedPairPath, setSelectedPairPath] = useState([]);

  const analyzeSelection = () => {
    const sel = selectedNodes.slice();
    if (sel.length < 2) return;
    const pairs = [];
    for (let i = 0; i < sel.length; i++) {
      for (let j = i + 1; j < sel.length; j++) {
        const a = sel[i]; const b = sel[j];
        const res = dijkstra(graph, a, b);
        const dist = res.dist.get(b) || Infinity;
        pairs.push({ a, b, dist: dist === Infinity ? null : dist, path: res.path || [] });
      }
    }
    pairs.sort((x, y) => (x.dist === null ? Infinity : x.dist) - (y.dist === null ? Infinity : y.dist));
    setPairDistances(pairs);
    // highlight shortest finite path
    const firstFinite = pairs.find(p => p.dist !== null);
    setSelectedPairPath(firstFinite ? firstFinite.path : []);
  };

  // clear handler: reset graph and internal state
  const clearAll = () => {
    // stop animations and reset state
    setOrder([]); setPath([]); setAnimating(false);
    setSelectedNodes([]);
    setPairDistances([]); setSelectedPairPath([]);
    setStart(null); setGoal('');
    // reset graph model and prevent re-initialization samples
    graphRef.current = new GraphModel();
    // mark initialized so samples are not re-added
    if (initialized) initialized.current = true;
  };

  // register clear handler with parent if provided
  React.useEffect(() => {
    if (registerClear) registerClear(clearAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerClear]);

  return (
    <div className="visualizer-root">
      <div className="visualizer-left">
        <div style={{ marginBottom: 8 }}>
          <button onClick={addEdgeBetweenSelected} disabled={selectedNodes.length < 2}>Add Edge Between Selected</button>
          <button onClick={analyzeSelection} disabled={selectedNodes.length < 2} style={{ marginLeft: 8 }}>Analyze Selection</button>
        </div>
        <GraphView graph={graph} width={900} height={520} onAddNode={onAddNode} onSelectNode={onSelectNode} selectedNodes={selectedNodes} path={path} highlighted={highlighted} selectedPairPath={selectedPairPath} />
      </div>
      <div className="visualizer-right">
        <Controls graph={graph} algorithm={algorithm} setAlgorithm={setAlgorithm} start={start} setStart={setStart} goal={goal} setGoal={setGoal} onRun={onRun} onStep={onStep} onReset={onReset} animating={animating} setSpeed={setSpeed} speed={speed} />
        <div style={{ padding: 12 }}>
          <div><strong>Visited:</strong> {order.join(', ')}</div>
          <div><strong>Path:</strong> {path.length ? path.join(' → ') : '—'}</div>
        </div>
        <div style={{ padding: 12 }}>
          <h4>Selection Analysis</h4>
          <div><strong>Selected nodes:</strong> {selectedNodes.length ? selectedNodes.join(', ') : '—'}</div>
          <div style={{ marginTop: 8 }}>
            {pairDistances.length === 0 ? <div>No pairwise distances computed. Select nodes and click Analyze Selection.</div> : (
              <div>
                {pairDistances.map((p, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <strong>{p.a} ↔ {p.b}:</strong> {p.dist === null ? 'No path' : `${p.dist.toFixed(2)} (weight)`}
                  </div>
                ))}
                <div style={{ marginTop: 8 }}><strong>Shortest pair:</strong> {pairDistances[0] ? `${pairDistances[0].a} ↔ ${pairDistances[0].b} (${pairDistances[0].dist === null ? 'No path' : pairDistances[0].dist.toFixed(2)})` : '—'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
