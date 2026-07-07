import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import GetRecommendation from './pages/GetRecommendation';
import History from './pages/History';
import CropGuide from './pages/CropGuide';
import AIFarmingAdvisor from './pages/AIFarmingAdvisor';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/signin" />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="recommendation" element={<GetRecommendation />} />
        <Route path="history" element={<History />} />
        <Route path="guide" element={<CropGuide />} />
        <Route path="ai-advisor" element={<AIFarmingAdvisor />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
