import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import WorkerProfile from './pages/WorkerProfile';
import WorkerDashboard from './pages/WorkerDashboard';
import MyRequests from './pages/MyRequests';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
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
      </Routes>
    </Router>
  );
}

export default App;