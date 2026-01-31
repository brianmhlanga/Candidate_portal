import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Image, X, Check, Trash2, Eye, User } from 'lucide-react';
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
    const [showModal, setShowModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
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

            if (response.data && Array.isArray(response.data.photos)) {
                setPhotos(response.data.photos);
            } else {
                setPhotos([]);
                console.warn('Invalid photos data format:', response.data);
            }
        } catch (error) {
            console.error('Failed to fetch photos:', error);
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Approve this photo?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/uploads/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPhotos();
            // Update modal if open
            if (selectedPhoto && selectedPhoto.id === id) {
                setSelectedPhoto({ ...selectedPhoto, status: 'approved' });
            }
        } catch (error) {
            console.error('Failed to approve photo:', error);
            alert('Failed to approve photo');
        }
    };

    const handleReject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const reason = prompt('Reason for rejection:');
        if (reason === null) return;

        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/uploads/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPhotos();
            // Update modal if open
            if (selectedPhoto && selectedPhoto.id === id) {
                setSelectedPhoto({ ...selectedPhoto, status: 'rejected' });
            }
        } catch (error) {
            console.error('Failed to reject photo:', error);
            alert('Failed to reject photo');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.delete(`/admin/uploads/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPhotos();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to delete photo:', error);
            alert('Failed to delete photo');
        }
    };

    const handleView = (photo: Photo) => {
        setSelectedPhoto(photo);
        setShowModal(true);
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
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

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid>
                    {/* Standardized Header */}
                    <div className="page-header">
                        <div className="page-header-content">
                            <h1 className="page-title">
                                <Image size={32} color="#c9a227" />
                                Photo Uploads
                            </h1>
                            <p className="page-subtitle">Manage and moderate candidate photo submissions</p>
                        </div>
                        <div className="total-badge">
                            {photos.length} TOTAL
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-white py-5">
                            <div className="spinner-border text-gold" role="status"></div>
                        </div>
                    ) : (
                        <div className="media-grid">
                            {photos.length === 0 ? (
                                <div className="text-center text-muted col-12 py-5 border border-secondary rounded bg-dark">
                                    No photos found
                                </div>
                            ) : (
                                photos.map((photo) => (
                                    <div key={photo.id} className="media-card">
                                        <div
                                            className="media-preview-container"
                                            onClick={() => handleView(photo)}
                                        >
                                            <img
                                                src={getImageUrl(photo.file_url)}
                                                alt={photo.candidateName}
                                                className="media-image"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                            <div className="position-absolute top-0 end-0 m-2">
                                                {getStatusBadge(photo.status)}
                                            </div>
                                        </div>
                                        <div className="media-card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="media-info-col">
                                                    <h5 className="candidate-name mb-0">{photo.candidateName}</h5>
                                                    <div className="review-status-text">
                                                        {getReviewStatus(photo.status)}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="upload-date text-white-50">
                                                Uploaded: {new Date(photo.created_at).toLocaleDateString()}
                                            </p>

                                            <div className="media-actions">
                                                {photo.status === 'pending' ? (
                                                    <>
                                                        <Button
                                                            className="btn-gold flex-grow-1 me-1"
                                                            size="sm"
                                                            onClick={(e) => handleApprove(photo.id, e)}
                                                        >
                                                            <Check size={16} /> Approve
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="flex-grow-1 ms-1"
                                                            onClick={(e) => handleReject(photo.id, e)}
                                                        >
                                                            <X size={16} /> Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="w-100 text-center py-1 border rounded border-secondary text-white">
                                                        {getReviewStatus(photo.status)}
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                className="btn-outline-gold w-100 mt-2"
                                                size="sm"
                                                onClick={() => handleView(photo)}
                                            >
                                                <Eye size={16} /> View
                                            </Button>
                                            <Button
                                                className="btn-outline-gold w-100 mt-2"
                                                size="sm"
                                                onClick={() => navigate(`/admin/candidates/${photo.userId}`)}
                                            >
                                                <User size={16} /> View Candidate Profile
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="w-100 mt-2"
                                                onClick={(e) => handleDelete(photo.id, e)}
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

                {/* Photo View Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" contentClassName="bg-dark border-secondary">
                    <Modal.Header closeButton closeVariant="white" className="border-secondary">
                        <Modal.Title className="text-white">
                            {selectedPhoto?.candidateName}'s Photo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center p-0 bg-black" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedPhoto && (
                            <img
                                src={getImageUrl(selectedPhoto.file_url)}
                                alt={selectedPhoto.candidateName}
                                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                            />
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-secondary justify-content-between">
                        <div>
                            {selectedPhoto && getStatusBadge(selectedPhoto.status)}
                        </div>
                        <div className="d-flex gap-2">
                            {selectedPhoto?.userId && (
                                <Button
                                    className="btn-outline-gold"
                                    onClick={() => {
                                        navigate(`/admin/candidates/${selectedPhoto.userId}`);
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

export default AdminPhotos;
