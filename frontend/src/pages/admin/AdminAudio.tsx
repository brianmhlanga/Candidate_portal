import { useState, useEffect } from 'react';
import { Container, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Mic, Check, X, Trash2, User } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './AdminMedia.css';

interface Audio {
    id: string;
    title: string;
    candidateName: string;
    url: string;
    file_url: string; // Handle both potential backend property names
    duration: number;
    status: string;
    created_at: string;
    userId: string;
    attempts: number;
}

const AdminAudio = () => {
    const [audioRecordings, setAudioRecordings] = useState<Audio[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }

        fetchAudioRecordings();
    }, [navigate]);

    const fetchAudioRecordings = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await api.get('/admin/audio', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle both structure possibilities
            setAudioRecordings(response.data.audio || response.data.recordings || []);
        } catch (error) {
            console.error('Failed to fetch audio recordings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Approve this audio recording?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/uploads/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAudioRecordings();
        } catch (error) {
            console.error('Failed to approve audio:', error);
            alert('Failed to approve audio');
        }
    };

    const handleReject = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const reason = prompt('Reason for rejection:');
        if (reason === null) return;

        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/uploads/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAudioRecordings();
        } catch (error) {
            console.error('Failed to reject audio:', error);
            alert('Failed to reject audio');
        }
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this audio recording? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.delete(`/admin/uploads/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAudioRecordings();
        } catch (error) {
            console.error('Failed to delete audio:', error);
            alert('Failed to delete audio');
        }
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: string } = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'} className="status-badge">{status}</Badge>;
    };

    const getReviewStatus = (status: string) => {
        if (status === 'approved') return <span className="text-success">Approved</span>;
        if (status === 'rejected') return <span className="text-danger">Rejected</span>;
        return <span className="text-warning">Needs Review</span>;
    };

    const getMediaUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const backendBaseUrl = import.meta.env.DEV
            ? 'http://localhost:5000'
            : `${window.location.protocol}//${window.location.hostname}:5000`;
        return `${backendBaseUrl}${path}`;
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid>
                    {/* Standardized Header */}
                    <div className="page-header">
                        <div className="page-header-content">
                            <h1 className="page-title">
                                <Mic size={32} color="#c9a227" />
                                Audio Recordings
                            </h1>
                            <p className="page-subtitle">Listen to and manage candidate audio introductions</p>
                        </div>
                        <div className="total-badge">
                            {audioRecordings.length} TOTAL
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-white py-5">
                            <div className="spinner-border text-gold" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="media-grid">
                            {audioRecordings.length === 0 ? (
                                <div className="text-center text-muted col-12 py-5 border border-secondary rounded bg-dark">
                                    No audio recordings found
                                </div>
                            ) : (
                                audioRecordings.map((audio) => (
                                    <div key={audio.id} className="media-card">
                                        <div className="media-preview-container audio-preview">
                                            <div className="audio-icon mb-3">🎤</div>
                                            <audio
                                                controls
                                                className="w-100"
                                                src={getMediaUrl(audio.url || audio.file_url)}
                                            >
                                                Your browser does not support the audio tag.
                                            </audio>
                                            <div className="media-overlay">
                                                <span className="duration-badge">{formatDuration(audio.duration)}</span>
                                            </div>
                                            <div className="position-absolute top-0 end-0 m-2">
                                                {getStatusBadge(audio.status)}
                                            </div>
                                        </div>
                                        <div className="media-card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="media-info-col">
                                                    <h5 className="candidate-name mb-0">{audio.candidateName}</h5>
                                                    <div className="review-status-text">
                                                        {getReviewStatus(audio.status)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="upload-date text-white-50">
                                                Uploaded: {new Date(audio.created_at).toLocaleDateString()}
                                            </p>
                                            <div className="text-white-50 small mb-3">Attempts: {audio.attempts || 1}</div>

                                            <div className="media-actions">
                                                {audio.status === 'pending' ? (
                                                    <>
                                                        <Button
                                                            className="btn-gold flex-grow-1 me-1"
                                                            size="sm"
                                                            onClick={(e) => handleApprove(audio.id, e)}
                                                        >
                                                            <Check size={16} /> Approve
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="flex-grow-1 ms-1"
                                                            onClick={(e) => handleReject(audio.id, e)}
                                                        >
                                                            <X size={16} /> Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="w-100 text-center py-1 border rounded border-secondary text-white">
                                                        {getReviewStatus(audio.status)}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                className="btn-outline-gold w-100 mt-2"
                                                size="sm"
                                                onClick={() => navigate(`/admin/candidates/${audio.userId}`)}
                                            >
                                                <User size={16} /> View Candidate Profile
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="w-100 mt-2"
                                                onClick={(e) => handleDelete(audio.id, e)}
                                            >
                                                <Trash2 size={16} /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </Container>
            </div>
        </div>
    );
};

export default AdminAudio;
