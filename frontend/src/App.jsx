import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Hero from './components/Hero';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import TestComponent from './components/TestComponent';
import Problems from './components/Problems';
import CodeEditor from './components/CodeEditor';
import Profile from './components/Profile';
import QuestionUpload from './components/QuestionUpload';
import ProblemSolver from './components/ProblemSolver';
import DSASheet from './components/DSASheet';
import Challenges from './components/Challenges';
import Rewards from './components/Rewards';
import InterviewExamine from './components/InterviewExamine';
import Challenges1v1 from './components/Challenges1v1';
import ChallengeLobby from './components/ChallengeLobby';
import CodeDuelIDE from './components/CodeDuelIDE';
import ChallengeResults from './components/ChallengeResults';
import ContestCreation from './components/ContestCreation';
import JoinContest from './components/JoinContest';
import ContestInterface from './components/ContestInterface';
import ContestLeaderboard from './components/ContestLeaderboard';
import Contests from './components/Contests';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './components/AuthCallback';
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
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/problems" element={<Problems />} />
          <Route path="/code-editor" element={<CodeEditor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload-question" element={<QuestionUpload />} />
          <Route path="/solve/:id" element={<ProblemSolver />} />
          <Route path="/dsa-sheet" element={<DSASheet />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/create-contest" element={<ContestCreation />} />
          <Route path="/join-contest" element={<JoinContest />} />
          <Route path="/contest/:contestId" element={<ContestInterface />} />
          <Route path="/contest/:contestId/leaderboard" element={<ContestLeaderboard />} />
          <Route path="/challenges/1v1" element={<Challenges1v1 />} />
          <Route path="/challenge/:roomId/lobby" element={<ChallengeLobby />} />
          <Route path="/challenge/:roomId/duel" element={<CodeDuelIDE />} />
          <Route path="/challenge/:roomId/results" element={<ChallengeResults />} />
          <Route path="/rewards" element={<Rewards />} />
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
