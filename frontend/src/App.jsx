import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Hero from './components/Hero';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Problems from './components/Problems';
import CodeEditor from './components/CodeEditor';
import './App.css';

function HeroWithNav() {
  const navigate = useNavigate();
  return <Hero navigate={navigate} />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        
        <Routes>
          <Route path="/" element={<HeroWithNav />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/code-editor" element={<CodeEditor />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;
