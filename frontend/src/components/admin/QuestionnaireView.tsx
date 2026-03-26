import React from 'react';
import { Check, X, FileText } from 'lucide-react';
import "../../pages/admin/AdminCandidateDetails.css"; // Reuse existing styles

interface QuestionnaireViewProps {
    data: any;
}

const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({ data }) => {
    const formatObjectKey = (key: string) =>
        key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^./, (s) => s.toUpperCase());

    const renderValue = (value: any): React.ReactNode => {
        if (value === null || value === undefined || value === '') {
            return <span className="not-provided">Not provided</span>;
        }

        // Some questionnaire fields come back as JSON strings (e.g. "{...}").
        // If we detect that shape, try parsing so we can render as key/value.
        if (typeof value === 'string') {
            const s = value.trim();
            const looksLikeJsonObject = (s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'));
            if (looksLikeJsonObject) {
                try {
                    const parsed = JSON.parse(s);
                    return renderValue(parsed);
                } catch {
                    // If it's not valid JSON, fall through to plain string rendering.
                }
            }
            return String(value);
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return <span className="not-provided">Not provided</span>;
            return (
                <ul className="kv-ul mb-0 ps-3">
                    {value.map((item, index) => (
                        <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                    ))}
                </ul>
            );
        }

        if (typeof value === 'object') {
            const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '');
            if (entries.length === 0) return <span className="not-provided">Not provided</span>;
            return (
                <div className="kv-list">
                    {entries.map(([k, v]) => (
                        <div className="kv-pair" key={k}>
                            <span className="kv-key">{formatObjectKey(k)}:</span>
                            <span className="kv-value">{String(v)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return String(value);
    };

    if (!data) {
        return (
            <div className="empty-state">
                <FileText className="empty-state-icon" size={80} />
                <div className="empty-state-text">Questionnaire not submitted</div>
            </div>
        );
    }

    return (
        <div className="questionnaire-section">
            {/* Personal Information */}
            <div className="questionnaire-group">
                <h3 className="questionnaire-group-title">Personal Information</h3>
                <div className="row">
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Full Name</div>
                            <div className="field-value">
                                {data.firstName} {data.lastName}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Job Title</div>
                            <div className="field-value">
                                {data.jobTitle || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Date of Birth</div>
                            <div className="field-value">
                                {data.dateOfBirth || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Currently</div>
                            <div className="field-value">
                                {data.currently || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Driver's License</div>
                            <div className="field-value">
                                {data.driversLicense || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Marital Status</div>
                            <div className="field-value">
                                {data.maritalStatus || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="questionnaire-group">
                <h3 className="questionnaire-group-title">Contact Information</h3>
                <div className="row">
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Email Address</div>
                            <div className="field-value">
                                {data.emailAddress || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Contact Number</div>
                            <div className="field-value">
                                {data.contactNumber || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="questionnaire-field">
                            <div className="field-label">City</div>
                            <div className="field-value">
                                {data.city || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Experience */}
            <div className="questionnaire-group">
                <h3 className="questionnaire-group-title">Work Experience</h3>
                <div className="questionnaire-field">
                    <div className="field-label">Brief History, Achievements and Expectations</div>
                    <div className="field-value">
                        {renderValue(data.workExperience)}
                    </div>
                </div>
            </div>

            {/* Previous Employers */}
            {data.previousEmployers && data.previousEmployers.length > 0 && (
                <div className="questionnaire-group">
                    <h3 className="questionnaire-group-title">Previous Employers</h3>
                    <table className="questionnaire-table">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Role</th>
                                <th>References</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.previousEmployers.map((employer: any, index: number) => (
                                <tr key={index}>
                                    <td>{employer.companyName || '-'}</td>
                                    <td>{employer.role || '-'}</td>
                                    <td>{employer.references || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Referrals */}
            {data.referrals && data.referrals.length > 0 && (
                <div className="questionnaire-group">
                    <h3 className="questionnaire-group-title">Referrals</h3>
                    <table className="questionnaire-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Contact Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.referrals.map((referral: any, index: number) => (
                                <tr key={index}>
                                    <td>{referral.name || '-'}</td>
                                    <td>{referral.company || '-'}</td>
                                    <td>{referral.contactNumber || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Additional Information */}
            <div className="questionnaire-group">
                <h3 className="questionnaire-group-title">Additional Information</h3>
                <div className="row">
                    <div className="col-md-12">
                        <div className="questionnaire-field">
                            <div className="field-label">Where do you see yourself in 5 years?</div>
                            <div className="field-value">
                                {data.whereToBe5Years || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="questionnaire-field">
                            <div className="field-label">Reasons for Employment</div>
                            <div className="field-value">
                                {data.reasonsForEmployment || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Expected Salary</div>
                            <div className="field-value">
                                {data.expectedSalary || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="questionnaire-field">
                            <div className="field-label">Availability</div>
                            <div className="field-value">
                                {data.availability || <span className="not-provided">Not provided</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consent */}
            <div className="questionnaire-group">
                <h3 className="questionnaire-group-title">Consent Preferences</h3>
                <div className="consent-item">
                    {data.socialMediaConsent ? (
                        <Check className="consent-icon granted" size={20} />
                    ) : (
                        <X className="consent-icon denied" size={20} />
                    )}
                    <span>Social Media Consent</span>
                </div>
                <div className="consent-item">
                    {data.radioAdvertConsent ? (
                        <Check className="consent-icon granted" size={20} />
                    ) : (
                        <X className="consent-icon denied" size={20} />
                    )}
                    <span>Radio Advertisement Consent</span>
                </div>
                <div className="consent-item">
                    {data.displayPictureConsent ? (
                        <Check className="consent-icon granted" size={20} />
                    ) : (
                        <X className="consent-icon denied" size={20} />
                    )}
                    <span>Display Picture Consent</span>
                </div>
            </div>
        </div>
    );
};

export default QuestionnaireView;
