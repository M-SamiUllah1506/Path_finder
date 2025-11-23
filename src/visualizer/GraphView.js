import React, { useRef, useState, useEffect } from 'react';

function GraphView({ graph, width = 800, height = 500, onAddNode, onSelectNode, selectedNodes = [], path = [], highlighted = new Set(), selectedPairPath = [] }) {
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
  }, []);

  const nodes = graph.nodesArray();
  const edges = graph.edgesArray();

  const clientToSvg = (evt) => {
    const pt = svgRef.current.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const handleSvgClick = (e) => {
    if (e.target === svgRef.current) {
      const p = clientToSvg(e);
      onAddNode && onAddNode(p.x, p.y);
    }
  };

  const startDrag = (id, evt) => {
    evt.stopPropagation();
    setDragging(id);
  };
  const onMouseMove = (e) => {
    if (dragging) {
      const p = clientToSvg(e);
      const node = graph.getNode(dragging);
      node.x = p.x; node.y = p.y;
      // force update by toggling state
      setDragging(dragging);
    }
  };
  const onMouseUp = () => setDragging(null);

  const isOnPath = (id) => path.includes(id);
  const isOnSelectedPairPath = (id) => selectedPairPath && selectedPairPath.includes(id);

  // build set of edge pairs in selectedPairPath for highlighting
  const pairEdges = new Set();
  for (let i = 0; i + 1 < selectedPairPath.length; i++) {
    const a = selectedPairPath[i]; const b = selectedPairPath[i+1];
    pairEdges.add(`${a}|${b}`);
    pairEdges.add(`${b}|${a}`);
  }

  return (
    <svg ref={svgRef} width={width} height={height} onClick={handleSvgClick} onMouseMove={onMouseMove} onMouseUp={onMouseUp} style={{ border: '1px solid #ccc', background: '#fff' }}>
      {edges.map((e, i) => {
        const a = graph.getNode(e.a);
        const b = graph.getNode(e.b);
        const on = highlighted.has(`${e.a}|${e.b}`) || highlighted.has(`${e.b}|${e.a}`);
        const onPair = pairEdges.has(`${e.a}|${e.b}`) || pairEdges.has(`${e.b}|${e.a}`);
        const stroke = onPair ? '#2e7d32' : (on ? '#ff6b6b' : '#999');
        const width = onPair ? 4 : (on ? 4 : 2);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={width} />;
      })}

      {nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x},${n.y})`} onMouseDown={(e) => startDrag(n.id, e)} onClick={(e) => { e.stopPropagation(); onSelectNode && onSelectNode(n.id); }} style={{ cursor: 'pointer' }}>
          <circle r={isOnPath(n.id) || isOnSelectedPairPath(n.id) ? 10 : 7} fill={isOnSelectedPairPath(n.id) ? '#2e7d32' : (selectedNodes.includes(n.id) ? '#ffd54f' : isOnPath(n.id) ? '#ff6b6b' : '#3f51b5')} stroke="#222" strokeWidth={1} />
          <text x={12} y={5} fontSize={12} fill="#222">{n.id}</text>
        </g>
      ))}
    </svg>
  );
}

export default GraphView;
