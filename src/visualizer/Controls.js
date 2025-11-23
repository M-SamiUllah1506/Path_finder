import React from 'react';

function Controls({ graph, algorithm, setAlgorithm, start, setStart, goal, setGoal, onRun, onStep, onReset, animating, setSpeed, speed }) {
  const nodes = graph.nodesArray();
  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <label>Algorithm: </label>
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
          <option value="dijkstra">Dijkstra</option>
        </select>
        {(algorithm === 'bfs' || algorithm === 'dfs') && (
          <div style={{ marginTop: 8, color: '#b45500', fontSize: 13 }}>
            Note: BFS/DFS ignore edge weights and perform unweighted traversal. Use Dijkstra for weighted shortest paths.
          </div>
        )}
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Start: </label>
        <select value={start || ''} onChange={(e) => setStart(Number(e.target.value))}>
          <option value="">--</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Goal (optional): </label>
        <select value={goal || ''} onChange={(e) => setGoal(e.target.value ? Number(e.target.value) : '')}>
          <option value="">--</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Speed: </label>
        <input type="range" min="50" max="2000" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        <span style={{ marginLeft: 8 }}>{speed} ms</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onRun} disabled={!start || animating}>Run</button>
        <button onClick={onStep} disabled={!start || animating}>Step</button>
        <button onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}

export default Controls;



