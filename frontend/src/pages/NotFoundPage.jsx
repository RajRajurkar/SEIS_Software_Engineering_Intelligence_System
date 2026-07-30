import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

const NotFoundPage = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6">
    <div className="text-center max-w-md">
      <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
      <div className="p-4 bg-dark-800 rounded-full w-fit mx-auto mb-6">
        <SearchX className="h-10 w-10 text-dark-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
      <p className="text-dark-400 mb-8 leading-relaxed">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mx-auto w-fit">
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
