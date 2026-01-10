/**
 * Error Boundary component for graceful error handling
 */

import { Component, type ReactNode } from 'react';
import { Button, Card } from '@/components/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <div className="text-4xl mb-4">😵</div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleRetry}>
                Try Again
              </Button>
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
