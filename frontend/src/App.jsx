import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostGig from './pages/PostGig';
import GigDetails from './pages/GigDetails';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/post-gig" 
            element={
              <ProtectedRoute>
                <PostGig />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gig/:id" 
            element={
              <ProtectedRoute>
                <GigDetails />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;