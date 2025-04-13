import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Debug from './pages/auth/Debug';
import DebugAuth from './pages/auth/DebugAuth';
import Dashboard from './pages/Dashboard';
import Clients from './pages/clients/Clients';
import ClientDetail from './pages/clients/ClientDetail';
import ClientForm from './pages/clients/ClientForm';
import Sessions from './pages/sessions/Sessions';
import SessionForm from './pages/sessions/SessionForm';
import TestDatabaseConnection from './pages/TestDatabaseConnection';
import { AuthProvider } from './contexts/SupabaseAuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/debug-auth" element={<DebugAuth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/new" element={<SessionForm />} />
          <Route path="/sessions/:id/edit" element={<SessionForm />} />
          <Route path="/test-db" element={<TestDatabaseConnection />} />
          {/* Add more routes here as we build them */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 