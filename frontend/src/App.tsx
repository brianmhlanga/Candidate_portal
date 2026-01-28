import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// User pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCandidates from './pages/admin/AdminCandidates';
import AdminCandidateDetails from './pages/admin/AdminCandidateDetails';
import AdminQuestionnaires from './pages/admin/AdminQuestionnaires';
import AdminVideos from './pages/admin/AdminVideos';
import AdminPhotos from './pages/admin/AdminPhotos';
import AdminAudio from './pages/admin/AdminAudio';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* User routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/candidates" element={<AdminCandidates />} />
            <Route path="/admin/candidates/:id" element={<AdminCandidateDetails />} />
            <Route path="/admin/questionnaires" element={<AdminQuestionnaires />} />
            <Route path="/admin/videos" element={<AdminVideos />} />
            <Route path="/admin/photos" element={<AdminPhotos />} />
            <Route path="/admin/audio" element={<AdminAudio />} />

            {/* Redirect to admin login for /admin */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
