import { Modal, Button, Form } from 'react-bootstrap';

interface ConfirmationModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: string;
    showReasonInput?: boolean;
    reason?: string;
    onReasonChange?: (reason: string) => void;
}

const ConfirmationModal = ({
    show,
    onHide,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    confirmVariant = 'primary',
    showReasonInput = false,
    reason = '',
    onReasonChange
}: ConfirmationModalProps) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-dark text-white border-secondary">
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white">
                <p>{message}</p>
                {showReasonInput && onReasonChange && (
                    <Form.Group className="mt-3">
                        <Form.Label>Reason (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="Enter reason..."
                            className="bg-secondary text-white border-0"
                        />
                    </Form.Group>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-dark border-secondary">
                <Button variant="outline-light" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant={confirmVariant} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;
