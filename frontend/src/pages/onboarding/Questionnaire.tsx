import { useState, type FormEvent } from 'react';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import api from '../../services/api';
import { INDUSTRY_OPTIONS, matchParsedIndustry } from '../../constants/industryOptions';
import './OnboardingSteps.css';
import './Questionnaire.css';

interface QuestionnaireProps {
    onComplete?: (nextStep?: string) => void;
}

const Questionnaire = ({ onComplete }: QuestionnaireProps) => {
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        jobTitle: '',
        industry: '',
        dateOfBirth: '',
        currently: 'employed', // employed or looking
        driversLicense: 'yes', // yes or no
        maritalStatus: 'single', // married, divorced, single, single-mother

        // Contact Information
        emailAddress: '',
        contactNumber: '',
        city: '',

        // Work Experience
        workExperience: '',

        // Previous Employers (dynamic)
        previousEmployers: [
            { companyName: '', role: '', references: '' }
        ],

        // Referrals (dynamic)
        referrals: [
            { name: '', company: '', contactNumber: '' }
        ],

        // Additional Information
        whereToBe5Years: '',
        reasonsForEmployment: '',
        expectedSalary: '',
        availability: '',

        // Consent
        socialMediaConsent: false,
        radioAdvertConsent: false,
        displayPictureConsent: false
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // CV Upload state
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleEmployerChange = (index: number, field: string, value: string) => {
        const updatedEmployers = [...formData.previousEmployers];
        updatedEmployers[index] = { ...updatedEmployers[index], [field]: value };
        setFormData({ ...formData, previousEmployers: updatedEmployers });
    };

    const addEmployer = () => {
        setFormData({
            ...formData,
            previousEmployers: [...formData.previousEmployers, { companyName: '', role: '', references: '' }]
        });
    };

    const removeEmployer = (index: number) => {
        if (formData.previousEmployers.length > 1) {
            const updatedEmployers = formData.previousEmployers.filter((_, i) => i !== index);
            setFormData({ ...formData, previousEmployers: updatedEmployers });
        }
    };

    const handleReferralChange = (index: number, field: string, value: string) => {
        const updatedReferrals = [...formData.referrals];
        updatedReferrals[index] = { ...updatedReferrals[index], [field]: value };
        setFormData({ ...formData, referrals: updatedReferrals });
    };

    const addReferral = () => {
        setFormData({
            ...formData,
            referrals: [...formData.referrals, { name: '', company: '', contactNumber: '' }]
        });
    };

    const removeReferral = (index: number) => {
        if (formData.referrals.length > 1) {
            const updatedReferrals = formData.referrals.filter((_, i) => i !== index);
            setFormData({ ...formData, referrals: updatedReferrals });
        }
    };

    // Handle CV file selection
    const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
            setError('');
            setUploadSuccess('');
        }
    };

    // Handle CV upload and parsing
    const handleCVUpload = async () => {
        if (!cvFile) {
            setError('Please select a CV file first');
            return;
        }

        setUploading(true);
        setError('');
        setUploadSuccess('');

        try {
            const formDataToUpload = new FormData();
            formDataToUpload.append('cv', cvFile);

            const token = localStorage.getItem('token');
            const response = await api.post('/questionnaire/parse-cv', formDataToUpload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const parsedData = response.data.data;

                // Auto-fill form fields with parsed data
                setFormData(prevData => ({
                    ...prevData,
                    firstName: parsedData.firstName || prevData.firstName,
                    lastName: parsedData.lastName || prevData.lastName,
                    emailAddress: parsedData.emailAddress || prevData.emailAddress,
                    contactNumber: parsedData.contactNumber || prevData.contactNumber,
                    city: parsedData.city || prevData.city,
                    jobTitle: parsedData.jobTitle || prevData.jobTitle,
                    industry: matchParsedIndustry(parsedData.industry) || prevData.industry,
                    workExperience: parsedData.workExperience || prevData.workExperience,
                    expectedSalary: parsedData.expectedSalary || prevData.expectedSalary,
                    previousEmployers: parsedData.previousEmployers && parsedData.previousEmployers.length > 0
                        ? parsedData.previousEmployers
                        : prevData.previousEmployers
                }));

                setUploadSuccess('CV parsed successfully! Fields have been auto-filled. Please review and complete any missing information.');
            }
        } catch (err: any) {
            console.error('CV upload error:', err);
            setError(err.response?.data?.message || 'Failed to parse CV. Please try again or fill the form manually.');
        } finally {
            setUploading(false);
        }
    };

    // Clear CV and reset
    const handleClearCV = () => {
        setCvFile(null);
        setUploadSuccess('');
        setError('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            const questionnaireData = {
                ...formData,
                submittedAt: new Date().toISOString()
            };

            console.log('Submitting questionnaire...');
            await api.post('/questionnaire', questionnaireData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Questionnaire submitted successfully');

            try {
                await api.put('/auth/onboarding-step', {
                    onboardingStep: 'completion',
                    completed: true
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (stepErr: any) {
                console.error('Onboarding step update failed (questionnaire was saved):', stepErr);
                setError(
                    stepErr.response?.data?.message
                        ? `Your responses were saved, but we could not update your progress: ${stepErr.response.data.message}. You can continue from your dashboard.`
                        : 'Your responses were saved, but we could not update your onboarding step. Please refresh the page or contact support if this persists.'
                );
                if (onComplete) {
                    onComplete('congratulations');
                }
                return;
            }

            if (onComplete) {
                onComplete('congratulations');
            }

        } catch (err: any) {
            console.error('Questionnaire submission error:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to submit questionnaire. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="questionnaire-container">
            <div className="questionnaire-header">
                <div className="logo-section">
                    <img src="/assets/logo.png" alt="3% Generation" className="questionnaire-logo" />
                </div>
                <h2 className="questionnaire-title">Application Questionnaire</h2>
                <p className="questionnaire-subtitle">
                    Please fill in the form below and tick the appropriate boxes where necessary. By submitting this form, you certify that the information provided is honest and accurate.
                </p>
            </div>

            {error && (
                <Alert
                    variant={error.startsWith('Your responses were saved') ? 'warning' : 'danger'}
                    onClose={() => setError('')}
                    dismissible
                >
                    {error}
                </Alert>
            )}

            {uploadSuccess && (
                <Alert variant="success" onClose={() => setUploadSuccess('')} dismissible>
                    {uploadSuccess}
                </Alert>
            )}

            {/* CV Upload Section */}
            <div className="cv-upload-section">
                <div className="cv-upload-header">
                    <h3>📄 Quick Fill with Your CV</h3>
                    <p>Upload your CV (PDF, DOCX, or TXT) and we'll automatically fill in your details below</p>
                </div>

                <div className="cv-upload-controls">
                    <div className="cv-file-input-wrapper">
                        <label htmlFor="cv-file-input" className="cv-file-label">
                            {cvFile ? (
                                <>
                                    <span className="file-icon">📎</span>
                                    <span className="file-name">{cvFile.name}</span>
                                </>
                            ) : (
                                <>
                                    <span className="upload-icon">📁</span>
                                    <span>Choose CV File</span>
                                </>
                            )}
                        </label>
                        <input
                            id="cv-file-input"
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleCVFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {cvFile && (
                        <div className="cv-action-buttons">
                            <Button
                                className="golden-button"
                                onClick={handleCVUpload}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Parsing CV...
                                    </>
                                ) : (
                                    '⚡ Parse & Auto-Fill'
                                )}
                            </Button>
                            <Button
                                variant="outline-light"
                                onClick={handleClearCV}
                                disabled={uploading}
                                className="clear-cv-btn"
                            >
                                ✕ Clear
                            </Button>
                        </div>
                    )}
                </div>

                <div className="cv-upload-note">
                    <small>
                        💡 <strong>Supported formats:</strong> PDF, DOCX, DOC, TXT | <strong>Max size:</strong> 5MB
                    </small>
                </div>
            </div>

            <Form onSubmit={handleSubmit} className="questionnaire-form">
                {/* Personal Information */}
                <div className="form-section">
                    <h3 className="section-title">Personal Information</h3>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Job Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Industry *</Form.Label>
                                <Form.Select
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select industry…</option>
                                    {formData.industry && !(INDUSTRY_OPTIONS as readonly string[]).includes(formData.industry) && (
                                        <option value={formData.industry}>{formData.industry}</option>
                                    )}
                                    {INDUSTRY_OPTIONS.map((label) => (
                                        <option key={label} value={label}>
                                            {label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Date of Birth</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    placeholder="mm/dd/yyyy"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Currently</Form.Label>
                                <div className="radio-group">
                                    <Form.Check
                                        type="radio"
                                        label="Employed"
                                        name="currently"
                                        value="employed"
                                        checked={formData.currently === 'employed'}
                                        onChange={handleChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Looking"
                                        name="currently"
                                        value="looking"
                                        checked={formData.currently === 'looking'}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Driver's License</Form.Label>
                                <div className="radio-group">
                                    <Form.Check
                                        type="radio"
                                        label="Yes"
                                        name="driversLicense"
                                        value="yes"
                                        checked={formData.driversLicense === 'yes'}
                                        onChange={handleChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="No"
                                        name="driversLicense"
                                        value="no"
                                        checked={formData.driversLicense === 'no'}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Marital Status</Form.Label>
                                <div className="radio-group">
                                    <Form.Check
                                        type="radio"
                                        label="Married"
                                        name="maritalStatus"
                                        value="married"
                                        checked={formData.maritalStatus === 'married'}
                                        onChange={handleChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Divorced"
                                        name="maritalStatus"
                                        value="divorced"
                                        checked={formData.maritalStatus === 'divorced'}
                                        onChange={handleChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Single"
                                        name="maritalStatus"
                                        value="single"
                                        checked={formData.maritalStatus === 'single'}
                                        onChange={handleChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Single Mother"
                                        name="maritalStatus"
                                        value="single-mother"
                                        checked={formData.maritalStatus === 'single-mother'}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Contact Information */}
                <div className="form-section">
                    <h3 className="section-title">Contact Information</h3>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="emailAddress"
                                    value={formData.emailAddress}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Contact Number *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>

                {/* Work Experience */}
                <div className="form-section">
                    <h3 className="section-title">Work Experience</h3>

                    <Form.Group className="mb-3">
                        <Form.Label>Brief History, Achievements and Expectations *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="workExperience"
                            value={formData.workExperience}
                            onChange={handleChange}
                            placeholder="Provide a brief summary of your work history, key achievements, and future expectations."
                            required
                        />
                    </Form.Group>
                </div>

                {/* Previous Employers */}
                <div className="form-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="section-title mb-0">Previous Employers</h3>
                        <Button
                            variant="outline-light"
                            size="sm"
                            onClick={addEmployer}
                            className="add-repeater-btn"
                        >
                            + Add Employer
                        </Button>
                    </div>

                    <div className="table-header-row">
                        <div className="table-cell">COMPANY NAME</div>
                        <div className="table-cell">ROLE</div>
                        <div className="table-cell">REFERENCES (NAME, EMAIL, PHONE)</div>
                        <div className="table-cell-action"></div>
                    </div>

                    {formData.previousEmployers.map((employer, index) => (
                        <Row key={index} className="mb-2 align-items-center">
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    value={employer.companyName}
                                    onChange={(e) => handleEmployerChange(index, 'companyName', e.target.value)}
                                    placeholder="Company name"
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Control
                                    type="text"
                                    value={employer.role}
                                    onChange={(e) => handleEmployerChange(index, 'role', e.target.value)}
                                    placeholder="Your role"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    value={employer.references}
                                    onChange={(e) => handleEmployerChange(index, 'references', e.target.value)}
                                    placeholder="Contact details"
                                />
                            </Col>
                            <Col md={1} className="text-center">
                                {formData.previousEmployers.length > 1 && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeEmployer(index)}
                                        title="Remove"
                                    >
                                        ×
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    ))}
                </div>

                {/* Referrals */}
                <div className="form-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h3 className="section-title mb-0">Referrals</h3>
                        <Button
                            variant="outline-light"
                            size="sm"
                            onClick={addReferral}
                            className="add-repeater-btn"
                        >
                            + Add Referral
                        </Button>
                    </div>
                    <p className="section-description">
                        Add the names of three champions such as yourself that would benefit from this opportunity.
                    </p>

                    <div className="table-header-row">
                        <div className="table-cell">NAME</div>
                        <div className="table-cell">COMPANY</div>
                        <div className="table-cell">CONTACT NUMBER</div>
                        <div className="table-cell-action"></div>
                    </div>

                    {formData.referrals.map((referral, index) => (
                        <Row key={index} className="mb-2 align-items-center">
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    value={referral.name}
                                    onChange={(e) => handleReferralChange(index, 'name', e.target.value)}
                                    placeholder="Full name"
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Control
                                    type="text"
                                    value={referral.company}
                                    onChange={(e) => handleReferralChange(index, 'company', e.target.value)}
                                    placeholder="Company name"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="tel"
                                    value={referral.contactNumber}
                                    onChange={(e) => handleReferralChange(index, 'contactNumber', e.target.value)}
                                    placeholder="Phone number"
                                />
                            </Col>
                            <Col md={1} className="text-center">
                                {formData.referrals.length > 1 && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeReferral(index)}
                                        title="Remove"
                                    >
                                        ×
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    ))}
                </div>

                {/* Additional Information */}
                <div className="form-section">
                    <h3 className="section-title">Additional Information</h3>

                    <Form.Group className="mb-3">
                        <Form.Label>Where would you like to be in 5 years?</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="whereToBe5Years"
                            value={formData.whereToBe5Years}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>What are your reasons for seeking employment?</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="reasonsForEmployment"
                            value={formData.reasonsForEmployment}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Expected monthly salary?</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="expectedSalary"
                                    value={formData.expectedSalary}
                                    onChange={handleChange}
                                    placeholder="e.g., R15,000"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Availability</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleChange}
                                    placeholder="e.g., Immediate, 2 weeks notice"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Consent */}
                <div className="form-section">
                    <h3 className="section-title">Consent</h3>

                    <Form.Group className="mb-2">
                        <Form.Check
                            type="checkbox"
                            name="socialMediaConsent"
                            checked={formData.socialMediaConsent}
                            onChange={handleChange}
                            label="Do you agree to allow us to advertise your profile on our website?"
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Check
                            type="checkbox"
                            name="radioAdvertConsent"
                            checked={formData.radioAdvertConsent}
                            onChange={handleChange}
                            label="If your 30sec CV wins audio of the week, do you agree for us to advertise it on radio to increase your chances of employment?"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            name="displayPictureConsent"
                            checked={formData.displayPictureConsent}
                            onChange={handleChange}
                            label="Display my picture."
                        />
                    </Form.Group>
                </div>

                {/* Submit Button */}
                <div className="form-submit">
                    <Button
                        type="submit"
                        className="golden-button submit-button"
                        size="lg"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Submitting...
                            </>
                        ) : (
                            '📋 Submit Application'
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Questionnaire;
