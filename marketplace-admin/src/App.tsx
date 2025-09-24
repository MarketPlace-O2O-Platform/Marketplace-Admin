import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import StoresPage from './pages/StoresPage';
import StoreDetailPage from './pages/StoreDetailPage';
import CouponsPage from './pages/CouponsPage';
import CouponDetailPage from './pages/CouponDetailPage';
import CouponFormPage from './pages/CouponFormPage';
import PrivateRoute from './components/PrivateRoute';
import { authUtils } from './utils/auth';
import './App.css';

function App() {
  const isAuthenticated = authUtils.isAuthenticated();

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/users" replace /> : <LoginPage />
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/stores"
            element={
              <PrivateRoute>
                <StoresPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/stores/:id"
            element={
              <PrivateRoute>
                <StoreDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/coupons"
            element={
              <PrivateRoute>
                <CouponsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/coupons/create"
            element={
              <PrivateRoute>
                <CouponFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/coupons/:id"
            element={
              <PrivateRoute>
                <CouponDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/coupons/:id/edit"
            element={
              <PrivateRoute>
                <CouponFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/users" : "/login"} replace />}
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/users" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
