import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import WorkerProfile from './pages/WorkerProfile';
import WorkerDashboard from './pages/WorkerDashboard';
import MyRequests from './pages/MyRequests';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/worker-profile"
            element={<ProtectedRoute><WorkerProfile /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/my-requests"
            element={<ProtectedRoute><MyRequests /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
