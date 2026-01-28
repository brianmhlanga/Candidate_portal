import { useState, type FormEvent } from 'react';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import api from '../../services/api';
import './OnboardingSteps.css';

interface QuestionnaireProps {
    onComplete: (nextStep: string) => void;
}

const Questionnaire = ({ onComplete }: QuestionnaireProps) => {
    const [formData, setFormData] = useState({
        // Personal Information
        phone: '',
        dateOfBirth: '',
        city: '',
        state: '',
        country: '',

        // Professional Information
        occupation: '',
        yearsExperience: '',
        skills: '',
        education: '',

        // About You
        bio: '',
        careerGoals: '',
        availability: '',

        // Additional
        socialMedia: '',
        website: '',
        references: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // Format data to match backend expectations
            const questionnaireData = {
                personalInfo: {
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country
                },
                contactInfo: {
                    email: formData.phone,
                    phone: formData.phone,
                    location: `${formData.city}, ${formData.state}, ${formData.country}`
                },
                workExperience: {
                    occupation: formData.occupation,
                    yearsExperience: formData.yearsExperience,
                    skills: formData.skills,
                    education: formData.education,
                    bio: formData.bio
                },
                references: {
                    professionalReferences: formData.references || 'None provided'
                },
                additionalInfo: {
                    careerGoals: formData.careerGoals,
                    availability: formData.availability,
                    socialMedia: formData.socialMedia,
                    website: formData.website
                },
                consents: {
                    termsAccepted: true,
                    dataProcessing: true,
                    timestamp: new Date().toISOString()
                }
            };

            await api.post('/questionnaire', questionnaireData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update onboarding step
            await api.put('/auth/onboarding-step', {
                onboardingStep: 'completion',
                completed: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onComplete('completion');
        } catch (err: any) {
            console.error('Questionnaire submission error:', err);
            setError(err.response?.data?.message || 'Failed to submit questionnaire. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="onboarding-step questionnaire-step">
            <div className="step-header">
                <div className="step-icon-badge">📝</div>
                <h2>Complete Your Profile</h2>
                <p className="step-description">
                    Tell us more about yourself to help us match you with the best opportunities.
                </p>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <Form onSubmit={handleSubmit} className="questionnaire-form">
                {/* Personal Information */}
                <div className="form-section">
                    <h3 className="section-title">Personal Information</h3>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+1 (555) 123-4567"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Date of Birth *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>City *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>State/Province *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Country *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Professional Information */}
                <div className="form-section">
                    <h3 className="section-title">Professional Background</h3>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Current Occupation *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Model, Actor, Student"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Years of Experience *</Form.Label>
                                <Form.Select
                                    name="yearsExperience"
                                    value={formData.yearsExperience}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="0-1">Less than 1 year</option>
                                    <option value="1-3">1-3 years</option>
                                    <option value="3-5">3-5 years</option>
                                    <option value="5-10">5-10 years</option>
                                    <option value="10+">10+ years</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Skills & Talents *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            required
                            placeholder="List your key skills and talents..."
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Education</Form.Label>
                        <Form.Control
                            type="text"
                            name="education"
                            value={formData.education}
                            onChange={handleChange}
                            placeholder="Highest level of education"
                        />
                    </Form.Group>
                </div>

                {/* About You */}
                <div className="form-section">
                    <h3 className="section-title">About You</h3>

                    <Form.Group className="mb-3">
                        <Form.Label>Professional Bio *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            required
                            placeholder="Tell us about yourself, your background, and what makes you unique..."
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Career Goals *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="careerGoals"
                            value={formData.careerGoals}
                            onChange={handleChange}
                            required
                            placeholder="What are your career aspirations?"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Availability *</Form.Label>
                        <Form.Select
                            name="availability"
                            value={formData.availability}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select...</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="flexible">Flexible</option>
                            <option value="weekends">Weekends only</option>
                        </Form.Select>
                    </Form.Group>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                    <h3 className="section-title">Additional Information (Optional)</h3>

                    <Form.Group className="mb-3">
                        <Form.Label>Social Media Links</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="socialMedia"
                            value={formData.socialMedia}
                            onChange={handleChange}
                            placeholder="Instagram, LinkedIn, etc. (one per line)"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Portfolio/Website</Form.Label>
                        <Form.Control
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://your-portfolio.com"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Professional References</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="references"
                            value={formData.references}
                            onChange={handleChange}
                            placeholder="Names and contact information (optional)"
                        />
                    </Form.Group>
                </div>

                <div className="form-actions">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={submitting}
                        className="btn-submit"
                    >
                        {submitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <span className="button-icon">✓</span> Submit & Complete
                            </>
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Questionnaire;
