import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GitBranch,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Clock,
  GitCommit,
  Users,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import repositoryService from "../services/repositoryService";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import {
  formatRelativeTime,
  formatNumber,
  extractRepoName,
} from "../utils/formatters";

const RepoCard = ({ repo, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete analysis for ${repo.name || repo.github_url}?`))
      return;
    setDeleting(true);
    try {
      await repositoryService.deleteRepository(repo.id);
      toast.success("Analysis deleted");
      onDelete(repo.id);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
      setDeleting(false);
    }
  };

  const handleOpen = () => {
    if (repo.status === "completed") navigate(`/dashboard/${repo.id}`);
    else if (repo.status === "running" || repo.status === "pending")
      navigate(`/analysis/${repo.id}`);
  };

  return (
    <div
      onClick={handleOpen}
      className="card-hover cursor-pointer group animate-fade-in"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-primary-500/10 rounded-xl flex-shrink-0">
            <GitBranch className="h-5 w-5 text-primary-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-dark-100 truncate group-hover:text-white transition-colors">
              {repo.name || extractRepoName(repo.github_url)}
            </h3>
            <p className="text-xs text-dark-500 truncate">{repo.owner}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={repo.status} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-dark-600 hover:text-red-400 hover:bg-red-500/10
              rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
            title="Delete analysis"
          >
            {deleting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {repo.description && (
        <p className="text-sm text-dark-400 mb-4 line-clamp-2 leading-relaxed">
          {repo.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-dark-500">
        {repo.total_commits !== undefined && (
          <span className="flex items-center gap-1.5">
            <GitCommit className="h-3.5 w-3.5 text-primary-500" />
            {formatNumber(repo.total_commits)} commits
          </span>
        )}
        {repo.total_contributors !== undefined && (
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-emerald-500" />
            {formatNumber(repo.total_contributors)} contributors
          </span>
        )}
        {repo.primary_language && (
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary-400" />
            {repo.primary_language}
          </span>
        )}
        <span className="flex items-center gap-1.5 ml-auto">
          <Clock className="h-3.5 w-3.5" />
          {formatRelativeTime(repo.created_at || repo.completed_at)}
        </span>
      </div>

      {repo.status === "completed" && (
        <div className="mt-4 pt-4 border-t border-dark-800 flex gap-2">
          <Link
            to={`/dashboard/${repo.id}`}
            onClick={(e) => e.stopPropagation()}
            className="btn-primary text-xs flex-1 justify-center"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <a
            href={repo.github_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-ghost text-xs px-3"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};

const RepositoriesPage = () => {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await repositoryService.getAllRepositories();
      setRepos(res?.repositories || res || []);
    } catch (err) {
      setError(err.message || "Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (deletedId) => {
    setRepos((prev) => prev.filter((r) => r.id !== deletedId));
  };

  const filtered = repos.filter((r) => {
    const matchSearch =
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.github_url || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.owner || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading repositories…" />
      </div>
    );

  return (
    <div className="min-h-screen bg-dark-950 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-sm text-dark-500 mb-2">
            <GitBranch className="h-4 w-4" />
            Repositories
          </div>
          <h1 className="text-3xl font-bold text-white">
            Analysed Repositories
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {formatNumber(repos.length)} repositories in the system
          </p>
        </div>
        <button onClick={() => navigate("/")} className="btn-primary">
          <Plus className="h-4 w-4" />
          New Analysis
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border
          border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button onClick={load} className="ml-auto underline text-xs">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories…"
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "completed", "running", "pending", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize
                transition-all duration-150 border
                ${
                  filter === s
                    ? "bg-primary-600/20 text-primary-400 border-primary-500/30"
                    : "bg-dark-800 text-dark-400 border-dark-700 hover:text-dark-200"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((repo) => (
            <RepoCard key={repo.id} repo={repo} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GitBranch}
          title={search ? "No matching repositories" : "No repositories yet"}
          description={
            search
              ? "Try adjusting your search or filter."
              : "Submit a public GitHub repository to get started."
          }
          action={
            !search && (
              <button onClick={() => navigate("/")} className="btn-primary">
                <Plus className="h-4 w-4" />
                Analyse a Repository
              </button>
            )
          }
        />
      )}
    </div>
  );
};

export default RepositoriesPage;
