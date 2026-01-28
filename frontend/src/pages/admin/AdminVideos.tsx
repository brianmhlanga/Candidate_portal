import { useState, useEffect } from 'react';
import { Container, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './AdminMedia.css';

interface Video {
    id: string;
    title: string;
    candidateName: string;
    file_url: string;
    duration: number;
    status: string;
    created_at: string;
    userId: string;
}

const AdminVideos = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }

        fetchVideos();
    }, [navigate]);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await api.get('/admin/videos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(response.data.videos || []);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!window.confirm('Approve this video?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/uploads/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVideos();
        } catch (error) {
            console.error('Failed to approve video:', error);
            alert('Failed to approve video');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Reason for rejection:');
        if (reason === null) return;

        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/uploads/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVideos();
        } catch (error) {
            console.error('Failed to reject video:', error);
            alert('Failed to reject video');
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
        if (status === 'approved') return <span className="text-success">Shows in profile</span>;
        if (status === 'rejected') return <span className="text-danger">Rejected</span>;
        return <span className="text-warning">Needs Review</span>;
    };

    const getMediaUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        // Assuming backend is on port 5000, consistent with server.js
        return `http://localhost:5000${path}`;
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-white mb-0">Video Recordings</h2>
                        <span className="text-white-50">{videos.length} videos found</span>
                    </div>

                    {loading ? (
                        <div className="text-center text-white py-5">
                            <div className="spinner-border text-gold" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="media-grid">
                            {videos.length === 0 ? (
                                <div className="text-center text-muted col-12 py-5">
                                    No video recordings found
                                </div>
                            ) : (
                                videos.map((video) => (
                                    <div key={video.id} className="media-card">
                                        <div className="media-preview-container">
                                            <video
                                                controls
                                                className="media-player"
                                                src={getMediaUrl(video.file_url)}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                            <div className="media-overlay">
                                                <span className="duration-badge">{formatDuration(video.duration)}</span>
                                            </div>
                                        </div>
                                        <div className="media-card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="candidate-name mb-0">{video.candidateName}</h5>
                                                {getStatusBadge(video.status)}
                                            </div>
                                            <p className="upload-date text-white-50">
                                                Uploaded: {new Date(video.created_at).toLocaleDateString()}
                                            </p>

                                            <div className="media-actions">
                                                {video.status === 'pending' ? (
                                                    <>
                                                        <Button
                                                            className="btn-gold flex-grow-1 me-1"
                                                            size="sm"
                                                            onClick={() => handleApprove(video.id)}
                                                        >
                                                            ✓ Approve
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="flex-grow-1 ms-1"
                                                            onClick={() => handleReject(video.id)}
                                                        >
                                                            ✗ Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="w-100 text-center py-1 border rounded border-secondary">
                                                        {getReviewStatus(video.status)}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                className="btn-outline-gold w-100 mt-2"
                                                size="sm"
                                                onClick={() => navigate(`/admin/candidates/${video.userId}`)}
                                            >
                                                View Candidate Profile
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

export default AdminVideos;
