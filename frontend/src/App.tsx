import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// User pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';


// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCandidates from './pages/admin/AdminCandidates';
import AdminCandidateDetails from './pages/admin/AdminCandidateDetails';
import AdminQuestionnaires from './pages/admin/AdminQuestionnaires';
import AdminQuestionnaireDetails from './pages/admin/AdminQuestionnaireDetails';
import AdminVideos from './pages/admin/AdminVideos';
import AdminPhotos from './pages/admin/AdminPhotos';
import AdminAudio from './pages/admin/AdminAudio';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminPublicRoute from './components/admin/AdminPublicRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin routes - OUTSIDE AuthProvider to prevent conflicts */}
          <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/candidates" element={<AdminProtectedRoute><AdminCandidates /></AdminProtectedRoute>} />
          <Route path="/admin/candidates/:id" element={<AdminProtectedRoute><AdminCandidateDetails /></AdminProtectedRoute>} />
          <Route path="/admin/questionnaires" element={<AdminProtectedRoute><AdminQuestionnaires /></AdminProtectedRoute>} />
          <Route path="/admin/questionnaires/:id" element={<AdminProtectedRoute><AdminQuestionnaireDetails /></AdminProtectedRoute>} />
          <Route path="/admin/videos" element={<AdminProtectedRoute><AdminVideos /></AdminProtectedRoute>} />
          <Route path="/admin/photos" element={<AdminProtectedRoute><AdminPhotos /></AdminProtectedRoute>} />
          <Route path="/admin/audio" element={<AdminProtectedRoute><AdminAudio /></AdminProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          {/* User routes - wrapped in AuthProvider */}
          <Route path="/*" element={
            <AuthProvider>
              <Routes>
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/onboarding/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
