import React from 'react';
import Clock from './Clock';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Clock App</h1>
        <Clock />
      </header>
    </div>
  );
};

export default App;