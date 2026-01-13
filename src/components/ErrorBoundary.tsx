import type { FallbackProps } from 'react-error-boundary';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 text-center">
            <div className="inline-flex p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            We encountered an unexpected error. Don't worry, your work is saved locally.
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-950 p-3 rounded text-left overflow-auto max-h-32 mb-6">
            <code className="text-xs font-mono text-red-500">{error.message}</code>
          </div>

          <button
            onClick={resetErrorBoundary}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};
