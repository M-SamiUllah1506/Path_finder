import './App.css';
import React, { useState, useEffect } from 'react';
import LogisticsApp from './logistics/LogisticsApp';
import Visualizer from './visualizer/Visualizer';

function App() {
  const [view, setView] = useState('home'); // 'home' | 'visualizer' | 'logistics'
  const [showHelp, setShowHelp] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);

  const Home = () => (
    <div className="home-root">
      <header className="hero">
        <div className="hero-inner">
          <h1 className="title">Path Finder</h1>
          <p className="subtitle">Interactive graph algorithms & logistics visualization — learn, experiment, and prototype routing solutions.</p>
          <div className="hero-ctas">
            <button onClick={() => setView('visualizer')} className="primary">Try Visualizer</button>
            <button onClick={() => setView('logistics')} className="secondary">Open Logistics Dashboard</button>
          </div>
        </div>
        <div className="hero-graphic" aria-hidden>
          <svg width="320" height="160" viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="320" height="160" rx="8" fill="url(#g)" />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#1976d2" />
                <stop offset="1" stopColor="#7b1fa2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </header>

      <section className="features">
        <div className="feature">
          <h3>Visual Algorithms</h3>
          <p>Step through BFS, DFS, Dijkstra and A* with an interactive canvas.</p>
        </div>
        <div className="feature">
          <h3>Interactive Graphs</h3>
          <p>Create nodes, add edges, and see traversals animate in real time.</p>
        </div>
        <div className="feature">
          <h3>Logistics Tools</h3>
          <p>Prototype routing and optimization with the logistics dashboard.</p>
        </div>
        <div className="feature">
          <h3>Extendable</h3>
          <p>Modular code structure to add new algorithms and experiments quickly.</p>
        </div>
      </section>

      <footer className="home-footer">
        <div>Made with care — open the Visualizer or Logistics Dashboard to get started.</div>
      </footer>
    </div>
  );

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // trigger fade-out then fade-in when view changes
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [view]);

  // sync with browser history / URL and handle back/forward
  useEffect(() => {
    const handlePop = () => {
      const p = window.location.pathname.replace(/^\/+/, '');
      if (p === 'visualizer' || p === 'logistics' || p === '') setView(p === '' ? 'home' : p);
    };
    window.addEventListener('popstate', handlePop);
    // initial sync
    const p = window.location.pathname.replace(/^\/+/, '');
    if (p === 'visualizer' || p === 'logistics') setView(p);
    else setView('home');
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigateTo = (v) => {
    setView(v);
    const url = v === 'home' ? '/' : `/${v}`;
    try { window.history.pushState({ view: v }, '', url); } catch (e) { /* ignore */ }
    if (v === 'visualizer' && localStorage.getItem('pf_onboard_shown') !== '1') {
      setShowOnboard(true);
    }
  };

  return (
    <div className="app-root">
      <nav className="top-nav">
        <div className="brand" onClick={() => navigateTo('home')}>Path Finder</div>
        <div className="nav-actions">
          <button onClick={() => navigateTo('visualizer')} className="link">Visualizer</button>
          <button onClick={() => navigateTo('logistics')} className="link">Logistics</button>
        </div>
      </nav>

      <button className="floating-help" title="Help" onClick={() => setShowHelp(true)}>?</button>

      {/* Help modal */}
      {showHelp && (
        <div className="modal-backdrop" onClick={() => setShowHelp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Quick Help</h3>
            <p>Use the Visualizer to create nodes (click), select nodes, add edges, and run algorithms. Open Logistics for route tools.</p>
            <div className="modal-actions">
              <button onClick={() => { setShowHelp(false); navigateTo('visualizer'); }}>Open Visualizer</button>
              <button onClick={() => { setShowHelp(false); navigateTo('logistics'); }} className="secondary">Open Logistics</button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding overlay for the Visualizer */}
      {showOnboard && (
        <div className="onboard-overlay" role="dialog" aria-modal>
          <div className="onboard-card">
            <h3>Welcome to the Visualizer</h3>
            <ul>
              <li>Click the canvas to add nodes.</li>
              <li>Click two nodes (select) and use "Add Edge Between Selected" to connect them.</li>
              <li>Choose an algorithm and press Run to animate traversal.</li>
            </ul>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { localStorage.setItem('pf_onboard_shown', '1'); setShowOnboard(false); }}>Got it</button>
              <button className="secondary" onClick={() => { localStorage.setItem('pf_onboard_shown', '1'); setShowOnboard(false); navigateTo('visualizer'); }}>Start</button>
            </div>
          </div>
        </div>
      )}

      <main>
        <div className={"view-content" + (visible ? ' visible' : '')}>
          {view === 'home' && <Home />}
          {view === 'visualizer' && (
            <div style={{ padding: 12 }}>
              <button onClick={() => navigateTo('home')} className="back">← Back</button>
              <Visualizer />
            </div>
          )}
          {view === 'logistics' && (
            <div style={{ padding: 12 }}>
              <button onClick={() => navigateTo('home')} className="back">← Back</button>
              <LogisticsApp />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
