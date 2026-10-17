import React from 'react';
import { FolderOpen } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({
  title = 'No records found',
  message = 'There are no items to display at this moment.',
  icon,
  action,
  actionLabel,
  onAction
}) {
  const renderAction = () => {
    // If action is an object with label and onClick
    if (action && typeof action === 'object' && !React.isValidElement(action)) {
      if (action.label && typeof action.onClick === 'function') {
        return (
          <button type="button" className="btn btn-primary" onClick={action.onClick}>
            {action.label}
          </button>
        );
      }
    }

    // If actionLabel and onAction are passed
    if (actionLabel && typeof onAction === 'function') {
      return (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      );
    }

    // If action is a React element or string
    if (action && (React.isValidElement(action) || typeof action === 'string')) {
      return action;
    }

    return null;
  };

  const actionContent = renderAction();

  return (
    <div className="empty-state-container">
      <div className="empty-icon-box">
        {icon ? icon : <FolderOpen size={48} className="empty-icon" />}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {actionContent && <div className="empty-action">{actionContent}</div>}
    </div>
  );
}
