import { useState, useEffect } from 'react';
import { Container, Badge, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Video, X, Check, Trash2, Play, User } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './AdminMedia.css';

interface VideoData {
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
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
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
            if (response.data && Array.isArray(response.data.videos)) {
                setVideos(response.data.videos);
            } else {
                setVideos([]);
                console.warn('Invalid videos data format:', response.data);
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Approve this video?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/uploads/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVideos();
            if (selectedVideo && selectedVideo.id === id) {
                setSelectedVideo({ ...selectedVideo, status: 'approved' });
            }
        } catch (error) {
            console.error('Failed to approve video:', error);
            alert('Failed to approve video');
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
            fetchVideos();
            if (selectedVideo && selectedVideo.id === id) {
                setSelectedVideo({ ...selectedVideo, status: 'rejected' });
            }
        } catch (error) {
            console.error('Failed to reject video:', error);
            alert('Failed to reject video');
        }
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.delete(`/admin/uploads/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVideos();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to delete video:', error);
            alert('Failed to delete video');
        }
    };

    const handleView = (video: VideoData) => {
        setSelectedVideo(video);
        setShowModal(true);
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
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
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
                                <Video size={32} color="#c9a227" />
                                Video Recordings
                            </h1>
                            <p className="page-subtitle">Manage and review candidate video introductions</p>
                        </div>
                        <div className="total-badge">
                            {videos.length} TOTAL
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
                            {videos.length === 0 ? (
                                <div className="text-center text-muted col-12 py-5 border border-secondary rounded bg-dark">
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
                                            <div className="position-absolute top-0 end-0 m-2">
                                                {getStatusBadge(video.status)}
                                            </div>
                                        </div>
                                        <div className="media-card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="media-info-col">
                                                    <h5 className="candidate-name mb-0">{video.candidateName}</h5>
                                                    <div className="review-status-text">
                                                        {getReviewStatus(video.status)}
                                                    </div>
                                                </div>
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
                                                            onClick={(e) => handleApprove(video.id, e)}
                                                        >
                                                            <Check size={16} /> Approve
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="flex-grow-1 ms-1"
                                                            onClick={(e) => handleReject(video.id, e)}
                                                        >
                                                            <X size={16} /> Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="w-100 text-center py-1 border rounded border-secondary text-white">
                                                        {getReviewStatus(video.status)}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                className="btn-outline-gold w-100 mt-2"
                                                size="sm"
                                                onClick={() => handleView(video)}
                                            >
                                                <Play size={16} /> View & Play
                                            </Button>
                                            <Button
                                                className="btn-outline-gold w-100 mt-2"
                                                size="sm"
                                                onClick={() => navigate(`/admin/candidates/${video.userId}`)}
                                            >
                                                <User size={16} /> View Candidate Profile
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="w-100 mt-2"
                                                onClick={(e) => handleDelete(video.id, e)}
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

                {/* Video View Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" contentClassName="bg-dark border-secondary">
                    <Modal.Header closeButton closeVariant="white" className="border-secondary">
                        <Modal.Title className="text-white">
                            {selectedVideo?.candidateName}'s Video
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center p-0 bg-black" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedVideo && (
                            <video
                                controls
                                autoPlay
                                style={{ maxWidth: '100%', maxHeight: '70vh', width: '100%' }}
                                src={getMediaUrl(selectedVideo.file_url)}
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-secondary justify-content-between">
                        <div>
                            {selectedVideo && getStatusBadge(selectedVideo.status)}
                        </div>
                        <div className="d-flex gap-2">
                            {selectedVideo?.userId && (
                                <Button
                                    className="btn-outline-gold"
                                    onClick={() => {
                                        navigate(`/admin/candidates/${selectedVideo.userId}`);
                                        setShowModal(false);
                                    }}
                                >
                                    View Profile
                                </Button>
                            )}
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default AdminVideos;
