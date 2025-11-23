import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function ClickHandler({ onMapClick }) {
  useMapEvents({ click(e) { onMapClick && onMapClick(e.latlng); } });
  return null;
}

export default function MapPanel({ graph, center = [30.3753, 69.3451], zoom = 6, onMapClick, route = [], selected = [], vehiclePosition = null, vehicleAngle = 0, onSelectNode, reached = new Set(), connected = new Set(), selectedPairPath = [] }) {
  const nodes = graph.nodesArray();
  const edges = graph.edgesArray();
  // build a set of edge-pairs that belong to the current route for highlighting
  const routePairs = new Set();
  for (let i = 0; i + 1 < route.length; i++) {
    const a = route[i]; const b = route[i+1];
    routePairs.add(`${a}-${b}`);
    routePairs.add(`${b}-${a}`);
  }

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '600px', width: '100%' }}>
      <FitBounds route={route} graph={graph} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onMapClick={onMapClick} />
      {edges.map((e, i) => {
        const a = graph.getNode(e.a); const b = graph.getNode(e.b);
        const isRoute = routePairs.has(`${e.a}-${e.b}`);
        return <Polyline key={i} positions={[[a.lat,a.lng],[b.lat,b.lng]]} color={isRoute ? '#ff6b6b' : '#888'} weight={isRoute ? 4 : 2} />;
      })}
      {route.length > 1 && (
        <Polyline positions={route.map(id => { const n = graph.getNode(id); return [n.lat,n.lng]; })} color="#ff6b6b" weight={4} />
      )}
      {/* selected pair path highlighted in green */}
      {selectedPairPath && selectedPairPath.length > 1 && (
        <Polyline positions={selectedPairPath.map(id => { const n = graph.getNode(id); return [n.lat,n.lng]; })} color="#2e7d32" weight={4} />
      )}

      {nodes.map(n => (
        <CircleMarker
          key={n.id}
          center={[n.lat,n.lng]}
          radius={selected.includes(n.id) ? 10 : 6}
          color={selectedPairPath && selectedPairPath.includes(n.id) ? '#2e7d32' : (reached.has(n.id) ? '#2e7d32' : (connected.has(n.id) ? '#d32f2f' : (selected.includes(n.id) ? '#ffd54f' : '#1976d2')))}
          eventHandlers={{ click: () => onSelectNode && onSelectNode(n.id) }}
        >
          <Popup>
            <div>Node {n.id}</div>
            {reached.has(n.id) && <div style={{ color: '#2e7d32', fontWeight: 'bold' }}>Reached</div>}
            {connected.has(n.id) && <div style={{ color: '#d32f2f', fontWeight: 'bold' }}>Connected</div>}
            {selectedPairPath && selectedPairPath.includes(n.id) && <div style={{ color: '#2e7d32', fontWeight: 'bold' }}>Shortest Pair</div>}
          </Popup>
        </CircleMarker>
      ))}

      {vehiclePosition && (
        <Marker position={[vehiclePosition.lat, vehiclePosition.lng]} icon={L.divIcon({ className: 'vehicle-icon', html: `<div style="display:inline-block; transform: rotate(${vehicleAngle}deg);">✈️</div>`, iconSize: [30,30] })}>
          <Popup>Vehicle</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

function FitBounds({ route, graph }) {
  const map = useMap();
  useEffect(() => {
    if (!route || route.length < 2) return;
    const latlngs = route.map(id => {
      const n = graph.getNode(id);
      return [n.lat, n.lng];
    });
    try {
      map.fitBounds(latlngs, { padding: [50, 50] });
    } catch (e) {
      // ignore errors from map not initialized yet
    }
  }, [route, map, graph]);
  return null;
}
