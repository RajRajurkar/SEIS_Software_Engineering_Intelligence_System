import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Users,
  GitCommit,
  Calendar,
  Search,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import analyticsService from "../services/analyticsService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import {
  formatNumber,
  formatDate,
  formatRelativeTime,
  getInitials,
  stringToColor,
} from "../utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const ContributorCard = ({ contributor, rank, maxCommits }) => {
  const initials = getInitials(contributor.name || contributor.email);
  const gradient = stringToColor(contributor.name || contributor.email);
  const pct = maxCommits
    ? Math.round((contributor.commit_count / maxCommits) * 100)
    : 0;
  const isTop3 = rank <= 3;

  const rankColors = {
    1: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    2: "text-gray-300 bg-gray-500/10 border-gray-500/30",
    3: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  };

  return (
    <div className="card hover:border-primary-500/30 transition-all duration-200 group">
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center
          justify-center text-xs font-bold border
          ${rankColors[rank] || "text-dark-500 bg-dark-800 border-dark-700"}`}
        >
          {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
        </div>

        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br
          ${gradient} flex items-center justify-center
          text-sm font-bold text-white shadow-lg`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-dark-100 font-semibold truncate">
            {contributor.name || "Unknown"}
          </p>
          {contributor.email && (
            <p className="text-dark-500 text-xs truncate mt-0.5">
              {contributor.email}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-dark-400">
              <GitCommit className="h-3.5 w-3.5 text-primary-400" />
              <span className="font-semibold text-dark-200">
                {formatNumber(contributor.commit_count)}
              </span>{" "}
              commits
            </div>
            {contributor.first_commit && (
              <div className="flex items-center gap-1.5 text-xs text-dark-400">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                Since {formatDate(contributor.first_commit)}
              </div>
            )}
            {contributor.last_commit && (
              <div className="flex items-center gap-1.5 text-xs text-dark-400">
                <Clock className="h-3.5 w-3.5 text-orange-400" />
                Last: {formatRelativeTime(contributor.last_commit)}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-dark-700 rounded-full">
              <div
                className={`h-1.5 rounded-full bg-gradient-to-r
                  ${isTop3 ? "from-primary-500 to-primary-400" : "from-dark-500 to-dark-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-dark-500 w-10 text-right">
              {pct}%
            </span>
          </div>
        </div>
      </div>

      {contributor.modules?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-800">
          <p className="text-xs text-dark-500 mb-2 font-medium">
            Active Modules
          </p>
          <div className="flex flex-wrap gap-1.5">
            {contributor.modules.slice(0, 5).map((m, i) => (
              <span key={i} className="badge-blue text-xs">
                {m}
              </span>
            ))}
            {contributor.modules.length > 5 && (
              <span className="badge-gray text-xs">
                +{contributor.modules.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ContributorsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("commits");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await analyticsService.getContributorAnalytics(id);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load contributor data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading contributors…" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );

  const contributors = data?.contributors || [];
  const maxCommits = contributors[0]?.commit_count || 1;

  const filtered = contributors
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "commits") return b.commit_count - a.commit_count;
      if (sortBy === "recent")
        return new Date(b.last_commit) - new Date(a.last_commit);
      if (sortBy === "earliest")
        return new Date(a.first_commit) - new Date(b.first_commit);
      return 0;
    });

  const top10 = contributors.slice(0, 10);
  const barData = {
    labels: top10.map((c) => (c.name || c.email || "?").split(" ")[0]),
    datasets: [
      {
        label: "Commits",
        data: top10.map((c) => c.commit_count),
        backgroundColor: top10.map((_, i) =>
          i === 0
            ? "rgba(245,158,11,0.8)"
            : i === 1
              ? "rgba(156,163,175,0.8)"
              : i === 2
                ? "rgba(249,115,22,0.8)"
                : "rgba(99,102,241,0.6)",
        ),
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        grid: { color: "#1e293b" },
        ticks: { color: "#64748b", font: { size: 11 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-dark-950 p-6 lg:p-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-dark-500 mb-2">
          <Users className="h-4 w-4" />
          Contributor Analysis
        </div>
        <h1 className="text-3xl font-bold text-white">Contributors</h1>
        <p className="text-dark-400 text-sm mt-1">
          {formatNumber(contributors.length)} contributors found in repository
          history.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        {[
          {
            label: "Total Contributors",
            value: formatNumber(contributors.length),
            icon: Users,
            color: "text-primary-400",
            bg: "bg-primary-500/10",
          },
          {
            label: "Top Contributor",
            value: contributors[0]?.name?.split(" ")[0] || "—",
            icon: Award,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
          },
          {
            label: "Total Commits",
            value: formatNumber(
              contributors.reduce((s, c) => s + c.commit_count, 0),
            ),
            icon: GitCommit,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Most Recent",
            value: formatRelativeTime(
              contributors.sort(
                (a, b) => new Date(b.last_commit) - new Date(a.last_commit),
              )[0]?.last_commit,
            ),
            icon: Clock,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
          },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-dark-500">{s.label}</p>
              <p className="text-lg font-bold text-white mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-8 animate-slide-up animation-delay-200">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Top 10 Contributors</h2>
            <p className="section-subtitle">Ranked by number of commits</p>
          </div>
          <TrendingUp className="h-5 w-5 text-primary-400" />
        </div>
        <div className="h-56">
          {top10.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-dark-500 text-sm">No data</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up animation-delay-200">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contributors…"
            className="input pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input w-auto min-w-[180px] cursor-pointer"
        >
          <option value="commits"> Sort: Most Commits</option>
          <option value="recent"> Sort: Most Recent</option>
          <option value="earliest">Sort: Earliest First</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((c, i) => (
            <ContributorCard
              key={i}
              contributor={c}
              rank={contributors.indexOf(c) + 1}
              maxCommits={maxCommits}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-16">
            <Users className="h-10 w-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400">No contributors match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributorsPage;
