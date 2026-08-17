import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Freelancers from './pages/Freelancers';
import Services from './pages/Services';
import Clients from './pages/Clients';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          {/* Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Layout Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/freelancers" element={<Freelancers />} />
            <Route path="/services" element={<Services />} />
            <Route path="/clients" element={<Clients />} />
          </Route>

          {/* Default Fallback Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
