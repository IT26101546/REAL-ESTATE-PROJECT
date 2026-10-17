import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container page-wrapper container">
          <div className="error-boundary-card">
            <div className="error-boundary-icon-box">
              <AlertTriangle size={36} />
            </div>
            <h2 className="error-boundary-title">Something went wrong</h2>
            <p className="error-boundary-message">
              An unexpected error occurred while rendering this page. You can try refreshing or returning to the home page.
            </p>

            {this.state.error && (
              <div className="error-boundary-details">
                {this.state.error.toString()}
              </div>
            )}

            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                <RefreshCw size={16} />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={16} />
                <span>Go Back</span>
              </button>
              <a href="/" className="btn btn-secondary">
                <Home size={16} />
                <span>Home Page</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
