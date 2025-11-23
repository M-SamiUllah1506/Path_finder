import React from 'react';

export default function Controls({ graph, algorithm, setAlgorithm, start, setStart, goal, setGoal, onCompute, addEdgeBetween, selected, onAnimate, onStep, onReset, speed, setSpeed, connectMode, setConnectMode, connectStart }) {
  const nodes = graph.nodesArray();
  return (
    <div>
      <div className="controls-row">
        <label>Algorithm</label>
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A*</option>
          <option value="nn">Nearest Neighbor</option>
        </select>
      </div>

      <div className="controls-row">
        <label>Start Node</label>
        <select value={start || ''} onChange={(e) => setStart(Number(e.target.value))}>
          <option value="">--</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
        </select>
      </div>

      <div className="controls-row">
        <label>Goal Node (optional)</label>
        <select value={goal || ''} onChange={(e) => setGoal(e.target.value ? Number(e.target.value) : '')}>
          <option value="">--</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
        </select>
      </div>

      <div className="controls-row">
        <label>Speed (ms per step)</label>
        <input type="range" min="50" max="2000" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        <span style={{ marginLeft: 8 }}>{speed} ms</span>
      </div>

      <div className="controls-row">
        <button onClick={onCompute} disabled={!start}>Compute Route</button>
        <button onClick={onAnimate} disabled={!start} style={{ marginLeft: 8 }}>Animate Route</button>
      </div>

      <div className="controls-row">
        <button onClick={onStep} disabled={!start}>Step</button>
        <button onClick={onReset} style={{ marginLeft: 8 }}>Reset Vehicle</button>
        <button onClick={addEdgeBetween} disabled={selected.length < 2} style={{ marginLeft: 8 }}>Add Edge</button>
      </div>

      <div className="controls-row">
        <label style={{ marginRight: 8 }}>Connect Mode</label>
        <button onClick={() => setConnectMode(!connectMode)} style={{ background: connectMode ? '#2e7d32' : undefined }}>{connectMode ? 'Connecting: ON' : 'Connect Nodes'}</button>
        {connectMode && <div style={{ marginTop: 8 }}>Click two nodes on the map to connect them. Start: {connectStart || 'None'}</div>}
      </div>

      <div className="controls-row">
        <label>Selected nodes:</label>
        <div>{selected.length ? selected.join(', ') : 'None'}</div>
      </div>

      <div className="controls-row">
        <button onClick={() => { window.__undo && window.__undo(); }}>Undo Last</button>
        <button onClick={() => { window.__addToRoute && window.__addToRoute(); }} style={{ marginLeft: 8 }}>Add To Route</button>
        <button onClick={() => { window.__clearRoute && window.__clearRoute(); }} style={{ marginLeft: 8 }}>Clear Route</button>
      </div>
    </div>
  );
}
