import { useState, type FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
    const { login } = useAuth();
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
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            // Handle different error responses
            if (err.response?.status === 401) {
                setError('Invalid email or password. Please check your credentials and try again.');
            } else if (err.response?.status === 404) {
                setError('No account found with this email. Please register first.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed. Please try again or contact support if the problem persists.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    {/* Logo */}
                    <div className="logo-container">
                        <img src="/assets/logo.png" alt="3% Generation" className="logo" />
                    </div>

                    {/* Welcome Text */}
                    <h2 className="welcome-title">Welcome Back</h2>
                    <p className="welcome-subtitle">Access your candidate portal to continue your journey</p>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger" className="login-alert">
                            <strong>⚠️ Login Failed</strong>
                            <div className="mt-1">{error}</div>
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label className="form-label">
                                Email Address <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setValidationErrors({ ...validationErrors, email: undefined });
                                }}
                                className={`login-input ${validationErrors.email ? 'is-invalid' : ''}`}
                                isInvalid={!!validationErrors.email}
                            />
                            {validationErrors.email && (
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.email}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label className="form-label">
                                Password <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setValidationErrors({ ...validationErrors, password: undefined });
                                }}
                                className={`login-input ${validationErrors.password ? 'is-invalid' : ''}`}
                                isInvalid={!!validationErrors.password}
                            />
                            {validationErrors.password && (
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.password}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <div className="text-end mb-3">
                            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                        </div>

                        <Button
                            type="submit"
                            className="login-button w-100"
                            disabled={loading}
                        >
                            <span className="button-icon">🔓</span> {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </Form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <div className="register-link">
                        New to 3% Generation? <Link to="/register" className="create-account-link">Create an account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
