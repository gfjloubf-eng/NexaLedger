import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Wallets from './pages/Wallets';
import Goals from './pages/Goals';
import AI from './pages/AI';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Register';
import ProtectedRoute from './context/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />

          {/* Foundation modules (UI placeholders only) */}
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;





