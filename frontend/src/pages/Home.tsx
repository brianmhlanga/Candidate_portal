import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6} className="text-center">
                    <h1 className="display-4 mb-4">Welcome to 3 Percent</h1>
                    <p className="lead mb-4">
                        Your platform for candidate management and assessment
                    </p>

                    {isAuthenticated ? (
                        <div>
                            <p className="mb-4">Hello, {user?.email}!</p>
                            <Link to="/dashboard">
                                <Button variant="primary" size="lg">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="d-flex gap-3 justify-content-center">
                            <Link to="/login">
                                <Button variant="primary" size="lg">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="outline-primary" size="lg">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
