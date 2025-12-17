import React from 'react';
import { Button } from 'flowbite-react';
import { HiRefresh, HiHome } from 'react-icons/hi';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-gray-900 px-4">
          <div className="text-center max-w-2xl">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {/* Error Details (only in development) */}
            {import.meta.env.MODE === 'development' && this.state.error && (
              <div className="my-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                gradientDuoTone="purpleToPink"
                size="lg"
                onClick={() => window.location.reload()}
              >
                <HiRefresh className="mr-2 w-5 h-5" />
                Reload Page
              </Button>
              <Link to="/">
                <Button color="gray" size="lg">
                  <HiHome className="mr-2 w-5 h-5" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
