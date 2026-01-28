import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './AdminMedia.css';

interface Photo {
    id: string;
    title: string;
    candidateName: string;
    file_url: string;
    file_size: number;
    status: string;
    created_at: string;
    userId: string;
}

const AdminPhotos = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }

        fetchPhotos();
    }, [navigate]);

    const fetchPhotos = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await api.get('/admin/photos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPhotos(response.data.photos || []);
        } catch (error) {
            console.error('Failed to fetch photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!window.confirm('Approve this photo?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/uploads/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPhotos();
        } catch (error) {
            console.error('Failed to approve photo:', error);
            alert('Failed to approve photo');
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
            fetchPhotos();
        } catch (error) {
            console.error('Failed to reject photo:', error);
            alert('Failed to reject photo');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return 'N/A';
        const kb = bytes / 1024;
        const mb = kb / 1024;
        return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: string } = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid>
                    <h2 className="mb-4 text-white">Photo Uploads</h2>

                    {loading ? (
                        <div className="text-center text-white">Loading...</div>
                    ) : photos.length === 0 ? (
                        <div className="text-center text-muted">No photos found</div>
                    ) : (
                        <Row>
                            {photos.map((photo) => (
                                <Col md={6} lg={4} xl={3} className="mb-4" key={photo.id}>
                                    <div className="stat-card h-100 d-flex flex-column">
                                        <div
                                            style={{
                                                height: '200px',
                                                overflow: 'hidden',
                                                backgroundColor: '#1a1a1a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative'
                                            }}
                                        >
                                            <img
                                                src={photo.file_url}
                                                alt={photo.candidateName}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                            <div className="position-absolute top-0 end-0 m-2">
                                                {getStatusBadge(photo.status)}
                                            </div>
                                        </div>
                                        <Card.Body className="d-flex flex-column flex-grow-1">
                                            <h6 className="text-white mb-2">{photo.candidateName}</h6>
                                            <small className="text-muted d-block mb-1">
                                                Size: {formatFileSize(photo.file_size)}
                                            </small>
                                            <small className="text-muted d-block mb-3">
                                                {new Date(photo.created_at).toLocaleDateString()}
                                            </small>

                                            <div className="mt-auto d-flex gap-2 mb-2">
                                                {photo.status !== 'approved' && (
                                                    <button
                                                        className="btn btn-sm btn-gold flex-grow-1"
                                                        onClick={() => handleApprove(photo.id)}
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                                {photo.status !== 'rejected' && (
                                                    <button
                                                        className="btn btn-sm btn-danger flex-grow-1"
                                                        onClick={() => handleReject(photo.id)}
                                                    >
                                                        ✗
                                                    </button>
                                                )}
                                            </div>

                                            <div className="d-flex gap-2">
                                                <a
                                                    href={photo.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-gold flex-grow-1"
                                                >
                                                    View
                                                </a>
                                                <button
                                                    className="btn btn-sm btn-outline-gold"
                                                    onClick={() => navigate(`/admin/candidates/${photo.userId}`)}
                                                >
                                                    Profile
                                                </button>
                                            </div>
                                        </Card.Body>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}

                    <div className="mt-3 text-white">
                        <small>Total Photos: {photos.length}</small>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default AdminPhotos;
