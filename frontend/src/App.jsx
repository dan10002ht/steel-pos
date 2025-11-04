import React, { Suspense, lazy } from 'react';
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
import SplashScreen from './components/SplashScreen';

// Lazy load all routes for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InventoryRoute = lazy(() => import('./routes/InventoryRoute'));
const Sales = lazy(() => import('./pages/sales'));
const CustomersRoute = lazy(() => import('./routes/CustomersRoute'));
const Reports = lazy(() => import('./pages/Reports'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ProductsRoute = lazy(() => import('./routes/ProductsRoute'));
const UserManagement = lazy(() => import('./pages/user-management'));

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <UiProvider>
          <InvoiceReservationProvider>
            <Router>
              <Suspense fallback={<SplashScreen />}>
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
                    <Route
                      path='user-management'
                      element={<UserManagement />}
                    />
                    <Route path='reports' element={<Reports />} />
                    <Route path='analytics' element={<Analytics />} />

                    {/* Default redirect */}
                    <Route
                      index
                      element={<Navigate to='/dashboard' replace />}
                    />
                  </Route>

                  {/* Catch all route */}
                  <Route
                    path='*'
                    element={<Navigate to='/dashboard' replace />}
                  />
                </Routes>
              </Suspense>
            </Router>
          </InvoiceReservationProvider>
        </UiProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
