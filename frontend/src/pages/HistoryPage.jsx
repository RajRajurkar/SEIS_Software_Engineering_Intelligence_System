import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  History,
  GitBranch,
  Clock,
  BarChart3,
  Search,
  ExternalLink,
  GitCommit,
  Users,
} from "lucide-react";
import repositoryService from "../services/repositoryService";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import {
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  extractRepoName,
} from "../utils/formatters";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await repositoryService.getAllRepositories();
        const sorted = (res?.repositories || res || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setRepos(sorted);
      } catch {
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = repos.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(q) ||
      (r.github_url || "").toLowerCase().includes(q) ||
      (r.owner || "").toLowerCase().includes(q)
    );
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading history…" />
      </div>
    );

  return (
    <div className="min-h-screen bg-dark-950 p-6 lg:p-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-dark-500 mb-2">
          <History className="h-4 w-4" />
          History
        </div>
        <h1 className="text-3xl font-bold text-white">Analysis History</h1>
        <p className="text-dark-400 text-sm mt-1">
          All previously submitted repositories
        </p>
      </div>

      <div className="relative max-w-md mb-6 animate-slide-up">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history…"
          className="input pl-10"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="card overflow-hidden animate-slide-up animation-delay-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  {[
                    "Repository",
                    "Owner",
                    "Language",
                    "Commits",
                    "Status",
                    "Submitted",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-dark-500 font-medium
                        text-xs uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {filtered.map((repo) => (
                  <tr
                    key={repo.id}
                    className="hover:bg-dark-800/40 transition-colors cursor-pointer"
                    onClick={() =>
                      repo.status === "completed"
                        ? navigate(`/dashboard/${repo.id}`)
                        : navigate(`/analysis/${repo.id}`)
                    }
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-primary-500/10 rounded-lg flex-shrink-0">
                          <GitBranch className="h-3.5 w-3.5 text-primary-400" />
                        </div>
                        <span className="text-dark-200 font-medium truncate max-w-[180px]">
                          {repo.name || extractRepoName(repo.github_url)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-dark-400">
                      {repo.owner || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {repo.primary_language ? (
                        <span className="badge-blue">
                          {repo.primary_language}
                        </span>
                      ) : (
                        <span className="text-dark-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-dark-400">
                      {repo.total_commits !== undefined
                        ? formatNumber(repo.total_commits)
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={repo.status} />
                    </td>
                    <td className="py-3 px-4 text-dark-500 whitespace-nowrap text-xs">
                      <div>{formatDateTime(repo.created_at)}</div>
                      <div className="text-dark-600">
                        {formatRelativeTime(repo.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {repo.status === "completed" && (
                          <Link
                            to={`/dashboard/${repo.id}`}
                            className="p-1.5 text-dark-500 hover:text-primary-400
                              hover:bg-primary-500/10 rounded-lg transition-all"
                            title="View dashboard"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Link>
                        )}
                        <a
                          href={repo.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-dark-500 hover:text-dark-300
                            hover:bg-dark-700 rounded-lg transition-all"
                          title="Open on GitHub"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={History}
          title={search ? "No results found" : "No analysis history"}
          description={
            search
              ? "Try a different search term."
              : "Your analysis history will appear here after you submit repositories."
          }
          action={
            !search && (
              <button onClick={() => navigate("/")} className="btn-primary">
                Start Analysing
              </button>
            )
          }
        />
      )}
    </div>
  );
};

export default HistoryPage;
