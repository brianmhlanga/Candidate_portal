import { useState, type FormEvent } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/Login.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(email, password, firstName, lastName);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container" style={{ maxWidth: '550px' }}>
                <div className="login-box">
                    {/* Logo */}
                    <div className="logo-container">
                        <img src="/assets/logo.png" alt="3% Generation" className="logo" />
                    </div>

                    {/* Welcome Text */}
                    <h2 className="welcome-title">Join 3% Generation</h2>
                    <p className="welcome-subtitle">Create your account to start your journey</p>

                    {/* Error Alert */}
                    {error && <Alert variant="danger" className="login-alert">{error}</Alert>}

                    {/* Register Form */}
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="firstName">
                                    <Form.Label className="form-label">First Name <span className="required">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="login-input"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="lastName">
                                    <Form.Label className="form-label">Last Name <span className="required">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="login-input"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label className="form-label">Email Address <span className="required">*</span></Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="login-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label className="form-label">Password <span className="required">*</span></Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="login-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="confirmPassword">
                            <Form.Label className="form-label">Confirm Password <span className="required">*</span></Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="login-input"
                            />
                        </Form.Group>

                        <Button
                            type="submit"
                            className="login-button w-100"
                            disabled={loading}
                        >
                            <span className="button-icon">✨</span> Create Account
                        </Button>
                    </Form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <div className="register-link">
                        Already have an account? <Link to="/login" className="create-account-link">Sign in here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
