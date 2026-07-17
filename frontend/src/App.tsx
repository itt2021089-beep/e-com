import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';
import Login from './pages/Login';
import Storefront from './pages/Storefront';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* CUSTOMER ROUTES (Wrapped in the Navbar Layout) */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Storefront />} />
            <Route path="/cart" element={<Cart />} />
          </Route>
        </Route>

        {/* ADMIN ROUTES (No Navbar, Dashboard handles its own UI) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;