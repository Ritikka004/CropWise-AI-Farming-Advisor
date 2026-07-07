import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sprout, Clock, BookOpen, Bot, LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Leaf size={28} color="#4CAF50" />
            <div>
              CropWise
              <span className="subtitle">AI Crop Advisor</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/recommendation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Sprout size={20} />
            Get Recommendation
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Clock size={20} />
            History
          </NavLink>
          <NavLink to="/guide" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            Crop Guide
          </NavLink>
          <NavLink to="/ai-advisor" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bot size={20} />
            AI Farming Advisor
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div style={{ marginBottom: '15px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
              Logged in as <br/><strong>{user.full_name}</strong>
            </div>
          )}
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
