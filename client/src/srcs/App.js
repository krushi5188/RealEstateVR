import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';

function App() {
  // For now, we will just render the Dashboard.
  // We will add back the routing and state management for the uploader and VR scene later.
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;
