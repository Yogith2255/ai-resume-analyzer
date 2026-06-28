import { Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/Dashboard/Dashboard";
import ResumeCoach from "./pages/ResumeCoach/ResumeCoach";
import Profile from "./pages/Profile/Profile";
import InterviewPrep from "./pages/InterviewPrep/InterviewPrep";
import NotFound from "./pages/NotFound/NotFound";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Layout from "./components/layout/Layout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />

      <Route path="/auth" element={<Auth />} />

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/resume-coach" 
        element={
          <ProtectedRoute>
            <Layout>
              <ResumeCoach />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/interview-prep" 
        element={
          <ProtectedRoute>
            <Layout>
              <InterviewPrep />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}