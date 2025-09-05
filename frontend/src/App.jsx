import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Hero from './components/Hero';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Problems from './components/Problems';
import CodeEditor from './components/CodeEditor';
import Profile from './components/Profile';
import QuestionUpload from './components/QuestionUpload';
import ProblemSolver from './components/ProblemSolver';
import DSASheet from './components/DSASheet';
import Challenges from './components/Challenges';
import Rewards from './components/Rewards';
import ChallengeRoom from './components/ChallengeRoom';
import InterviewExamine from './components/InterviewExamine';
import './App.css';

function HeroWithNav() {
  const navigate = useNavigate();
  return <Hero navigate={navigate} />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function InterviewExamineRedirect() {
  const { pathname } = useLocation();
  const newPath = pathname.replace('/interview-examine', '/interv-examine');
  return <Navigate to={newPath} replace />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HeroWithNav />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/code-editor" element={<CodeEditor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload-question" element={<QuestionUpload />} />
          <Route path="/solve/:id" element={<ProblemSolver />} />
          <Route path="/dsa-sheet" element={<DSASheet />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/challenge-room/:roomId" element={<ChallengeRoom />} />
          <Route path="/interview-examine" element={<InterviewExamineRedirect />} />
          <Route path="/interview-examine/:sessionId" element={<InterviewExamineRedirect />} />
          <Route path="/interv-examine" element={<InterviewExamine />} />
          <Route path="/interv-examine/:sessionId" element={<InterviewExamine />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;
