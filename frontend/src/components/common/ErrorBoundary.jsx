import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center p-6 text-[#0D0D0D]">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E3DCD3] p-8 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-xl font-bold text-[#0D0D0D]">Something went wrong</h2>
              <p className="text-xs text-[#736B63] leading-relaxed">
                An unexpected error occurred while rendering this page.
              </p>
              {this.state.error && (
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-left overflow-x-auto text-[11px] font-mono text-rose-800 max-h-32 overflow-y-auto">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReload}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Reload Page
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={this.handleGoHome}
                icon={<Home className="w-3.5 h-3.5" />}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
