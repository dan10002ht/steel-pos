import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import QueryProvider from './shared/providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { UiProvider } from './contexts/UiContext';
import { InvoiceReservationProvider } from './contexts/InvoiceReservationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InventoryRoute from './routes/InventoryRoute';
import Sales from './pages/sales';
import CustomersRoute from './routes/CustomersRoute';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import ProductsRoute from './routes/ProductsRoute';
import UserManagement from './pages/user-management';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <UiProvider>
          <InvoiceReservationProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path='/login' element={<Login />} />

                {/* Protected routes group */}
                <Route path='/' element={<ProtectedRoute />}>
                  <Route path='dashboard' element={<Dashboard />} />
                  <Route path='sales/*' element={<Sales />} />
                  <Route path='inventory/*' element={<InventoryRoute />} />
                  <Route path='products/*' element={<ProductsRoute />} />
                  <Route path='customers/*' element={<CustomersRoute />} />
                  <Route path='user-management' element={<UserManagement />} />
                  <Route path='reports' element={<Reports />} />
                  <Route path='analytics' element={<Analytics />} />

                  {/* Default redirect */}
                  <Route index element={<Navigate to='/dashboard' replace />} />
                </Route>

                {/* Catch all route */}
                <Route
                  path='*'
                  element={<Navigate to='/dashboard' replace />}
                />
              </Routes>
            </Router>
          </InvoiceReservationProvider>
        </UiProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
