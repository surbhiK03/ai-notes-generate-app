import React from "react";
import "./VoiceNotes.css";
 
const ConfirmModal = ({ open, title = "Confirm", message, onConfirm, onCancel }) => {
  if (!open) return null;
 
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal animate-pop" role="document">
        <button className="modal-close" aria-label="Close" onClick={onCancel}>
          ✕
        </button>
        <div className="modal-header">
          <div className="modal-icon">⚠️</div>
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default ConfirmModal;