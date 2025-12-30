
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Checklist from './pages/Checklist';
import Summary from './pages/Summary';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Inspections from './pages/Inspections';
import InspectionCover from './pages/InspectionCover';
import PhotoService from './pages/PhotoService';
import SubmissionSuccess from './pages/SubmissionSuccess';
import GasSuppression from './pages/GasSuppression';
import PanelDetail from './pages/PanelDetail';
import PumpSystem from './pages/PumpSystem';
import EquipmentSystem from './pages/EquipmentSystem';
import FireExtinguisher from './pages/FireExtinguisher';
import LightingSystem from './pages/LightingSystem';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app-container max-w-md mx-auto h-screen relative bg-background-dark shadow-2xl overflow-hidden flex flex-col font-sans text-white">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/inspections" 
            element={isAuthenticated ? <Inspections /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/inspection-cover/:id" 
            element={isAuthenticated ? <InspectionCover /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/checklist/:id" 
            element={isAuthenticated ? <Checklist /> : <Navigate to="/login" />} 
          />
          
          {/* Specific Systems Routes */}
          <Route path="/checklist/:id/panel" element={isAuthenticated ? <PanelDetail /> : <Navigate to="/login" />} />
          <Route path="/checklist/:id/gas" element={isAuthenticated ? <GasSuppression /> : <Navigate to="/login" />} />
          <Route path="/checklist/:id/pump/:type" element={isAuthenticated ? <PumpSystem /> : <Navigate to="/login" />} />
          <Route path="/checklist/:id/equip/:type" element={isAuthenticated ? <EquipmentSystem /> : <Navigate to="/login" />} />
          <Route path="/checklist/:id/extinguisher" element={isAuthenticated ? <FireExtinguisher /> : <Navigate to="/login" />} />
          <Route path="/checklist/:id/light/:type" element={isAuthenticated ? <LightingSystem /> : <Navigate to="/login" />} />

          <Route path="/photos/:id" element={isAuthenticated ? <PhotoService /> : <Navigate to="/login" />} />
          <Route path="/summary/:id" element={isAuthenticated ? <Summary /> : <Navigate to="/login" />} />
          <Route path="/success" element={isAuthenticated ? <SubmissionSuccess /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/admin/users" element={isAuthenticated ? <UserManagement /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
