import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
      <div className="p-4 bg-red-500/10 rounded-full mb-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-dark-300 mb-2">
        Something went wrong
      </h3>
      <p className="text-dark-500 text-sm max-w-sm mb-6">
        {message || "An unexpected error occurred. Please try again."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
