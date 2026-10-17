import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

export default function ConfirmModal({
  isOpen = true,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This operation cannot be undone.',
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  cancelLabel,
  onConfirm,
  onCancel,
  isDanger,
  danger,
  loading = false
}) {
  if (isOpen === false) return null;

  const finalConfirmText = loading ? 'Processing...' : (confirmLabel || confirmText || 'Confirm');
  const finalCancelText = cancelLabel || cancelText || 'Cancel';
  const dangerMode = danger !== undefined ? danger : (isDanger !== undefined ? isDanger : true);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-icon-title">
            <div className={`modal-alert-icon ${dangerMode ? 'alert-danger' : 'alert-info'}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onCancel} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {finalCancelText}
          </button>
          <button
            className={`btn ${dangerMode ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
