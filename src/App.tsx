import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import BusinessPulse from './pages/BusinessPulse';
import Wallets from './pages/Wallets';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';

import Goals from './pages/Goals';
import AI from './pages/AI';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Register';
import ProtectedRoute from './security/ProtectedRoute';
import Statements from './pages/Statements';
import DecisionCenter from './pages/DecisionCenter';
import CashFlowForecast from './pages/CashFlowForecast';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />

          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPermission="canViewReports" fallbackPath="/access-denied">
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route path="/business-pulse" element={<BusinessPulse />} />

          <Route path="/customers" element={<Customers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/payments" element={<Payments />} />

          <Route path="/statements" element={<Statements />} />

          {/* Foundation modules (UI placeholders only) */}

          <Route path="/wallets" element={<Wallets />} />

          <Route path="/goals" element={<Goals />} />
          <Route path="/ai" element={<AI />} />

          <Route
            path="/settings"
            element={
              <ProtectedRoute
                requiredPermission="canManageSettings"
                fallbackPath="/access-denied"
              >
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/decision-center"
            element={
              <ProtectedRoute
                requiredPermission="canAccessDecisionCenter"
                fallbackPath="/access-denied"
              >
                <DecisionCenter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cash-flow-forecast"
            element={
              <ProtectedRoute
                requiredPermission="canAccessForecast"
                fallbackPath="/access-denied"
              >
                <CashFlowForecast />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;

