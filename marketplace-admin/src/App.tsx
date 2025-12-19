import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import MembersPage from './pages/MembersPage';
import StoresPage from './pages/StoresPage';
import StoreDetailPage from './pages/StoreDetailPage';
import CouponsPage from './pages/CouponsPage';
import CouponDetailPage from './pages/CouponDetailPage';
import CouponFormPage from './pages/CouponFormPage';
import PaybackReceiptsPage from './pages/PaybackReceiptsPage';
import PaybackReceiptDetailPage from './pages/PaybackReceiptDetailPage';
import TempMarketsPage from './pages/TempMarketsPage';
import TempMarketDetailPage from './pages/TempMarketDetailPage';
import RequestMarketsPage from './pages/RequestMarketsPage';
import PrivateRoute from './components/PrivateRoute';
import { authUtils } from './utils/auth';
import { loadKakaoMapScript } from './utils/kakaoMap';
import './App.css';

function App() {
  const isAuthenticated = authUtils.isAuthenticated();

  useEffect(() => {
    // 카카오 맵 스크립트 로드
    loadKakaoMapScript().catch((error) => {
      console.error('카카오 맵 API 로드 실패:', error);
    });
  }, []);

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
            element={<PrivateRoute> <MembersPage /></PrivateRoute>}
          />
          <Route
            path="/stores"
            element={ <PrivateRoute> <StoresPage /></PrivateRoute>}
          />
          <Route
            path="/stores/:id"
            element={ <PrivateRoute><StoreDetailPage /></PrivateRoute>
            }
          />
          <Route
            path="/coupons"
            element={ <PrivateRoute><CouponsPage /></PrivateRoute>
            }
          />
          <Route
            path="/coupons/create"
            element={ <PrivateRoute> <CouponFormPage /> </PrivateRoute>
            }
          />
          <Route
            path="/coupons/:id"
            element={ <PrivateRoute> <CouponDetailPage /> </PrivateRoute>}
          />
          <Route
            path="/coupons/:id/edit"
            element={<PrivateRoute> <CouponFormPage /> </PrivateRoute>}
          />
          <Route
            path="/payback-receipts"
            element={ <PrivateRoute> <PaybackReceiptsPage /> </PrivateRoute>}
          />
          <Route
            path="/payback-receipts/:memberPaybackId"
            element={ <PrivateRoute> <PaybackReceiptDetailPage /> </PrivateRoute>}
          />
          <Route
            path="/temp-markets"
            element={ <PrivateRoute> <TempMarketsPage /> </PrivateRoute>}
          />
          <Route
            path="/temp-markets/:tempMarketId"
            element={ <PrivateRoute> <TempMarketDetailPage /> </PrivateRoute>}
          />
          <Route
            path="/request-markets"
            element={ <PrivateRoute> <RequestMarketsPage /> </PrivateRoute>}
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
