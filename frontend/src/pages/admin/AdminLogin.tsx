import { useState, type FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminLogin.css';
import './AdminMedia.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
    const navigate = useNavigate();

    const validateForm = () => {
        const errors: { email?: string; password?: string } = {};

        // Email validation
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        // Validate form first
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/admin/login', { email, password });
            const { token, user } = response.data;

            // Verify it's an admin user
            if (user.role !== 'admin') {
                setError('Access denied. This account does not have admin privileges.');
                setLoading(false);
                return;
            }

            // Store admin token and info
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));

            // Redirect to admin dashboard
            navigate('/admin/dashboard');
        } catch (err: any) {
            setLoading(false);

            // Handle different error responses
            if (err.response?.status === 401) {
                setError('Invalid email or password. Please check your credentials and try again.');
            } else if (err.response?.status === 403) {
                setError('Access denied. You do not have admin privileges.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed. Please try again or contact support if the problem persists.');
            }
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-box">
                    {/* Logo */}
                    <div className="admin-logo-container">
                        <img src="/assets/logo.png" alt="3% Generation" className="admin-logo" />
                    </div>

                    {/* Title */}
                    <h2 className="admin-title">Admin Dashboard</h2>
                    <p className="admin-subtitle">Enter your credentials to access the admin panel</p>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger" className="admin-alert">
                            <strong>⚠️ Login Failed</strong>
                            <div className="mt-1">{error}</div>
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group className="mb-3" controlId="adminEmail">
                            <Form.Label className="admin-form-label">
                                Email Address <span className="admin-required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setValidationErrors({ ...validationErrors, email: undefined });
                                }}
                                className={`admin-input ${validationErrors.email ? 'is-invalid' : ''}`}
                                isInvalid={!!validationErrors.email}
                            />
                            {validationErrors.email && (
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.email}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="adminPassword">
                            <Form.Label className="admin-form-label">
                                Password <span className="admin-required">*</span>
                            </Form.Label>
                            <div className="password-input-wrapper">
                                <Form.Control
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setValidationErrors({ ...validationErrors, password: undefined });
                                    }}
                                    className={`admin-input ${validationErrors.password ? 'is-invalid' : ''}`}
                                    isInvalid={!!validationErrors.password}
                                />
                                <span className="password-icon">👁</span>
                            </div>
                            {validationErrors.password && (
                                <div className="invalid-feedback d-block">
                                    {validationErrors.password}
                                </div>
                            )}
                        </Form.Group>

                        <Button
                            type="submit"
                            className="btn-gold w-100 py-2"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </Form>

                    <div className="admin-notice">
                        This area is restricted to authorized administrators only
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
