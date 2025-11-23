import './App.css';
import React, { useState } from 'react';
import LogisticsApp from './logistics/LogisticsApp';

function App() {
  const [showLogistics, setShowLogistics] = useState(false);
  return (
    <main>
      <div style={{ padding: 12 }}>
        <button onClick={() => setShowLogistics((s) => !s)}>
          {showLogistics ? 'Back' : 'Open Logistics Dashboard'}
        </button>
      </div>
      {showLogistics ? <LogisticsApp /> : (
        <div style={{ padding: 12 }}>
          <h2>Welcome</h2>
          <p>Use "Open Logistics Dashboard" to explore the project.</p>
        </div>
      )}
    </main>
  );
}

export default App;
