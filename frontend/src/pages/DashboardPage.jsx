import { useParams, Link } from "react-router-dom";
import {
  GitCommit,
  Users,
  Folder,
  Calendar,
  BarChart3,
  GitBranch,
  TrendingUp,
  Bot,
  ExternalLink,
  Activity,
  Code2,
  Zap,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { useDashboardOverview } from "../hooks/useAnalytics";
import { useRepository } from "../hooks/useRepository";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import StatCard from "../components/StatCard";
import {
  formatDate,
  formatNumber,
  formatRelativeTime,
  getCategoryColor,
} from "../utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const tooltipTheme = {
  backgroundColor: "#1e293b",
  titleColor: "#f1f5f9",
  bodyColor: "#94a3b8",
  borderColor: "#334155",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 8,
};
const gridColor = "#1e293b";
const tickColor = "#475569";
const tickFont = { size: 11 };

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tooltipTheme },
  scales: {
    x: {
      grid: { color: gridColor },
      ticks: { color: tickColor, font: tickFont },
    },
    y: {
      grid: { color: gridColor },
      ticks: { color: tickColor, font: tickFont },
      beginAtZero: true,
    },
  },
};

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: { color: tickColor, font: tickFont, boxWidth: 10, padding: 8 },
    },
    tooltip: tooltipTheme,
  },
};

const PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];
const NoData = () => (
  <div className="h-full flex items-center justify-center">
    <p className="text-dark-600 text-sm">No data available</p>
  </div>
);

const DashboardPage = () => {
  const { id } = useParams();

  const {
    data: repo,
    loading: repoLoading,
    error: repoError,
    refetch: repoRefetch,
  } = useRepository(id);
  const {
    data: overview,
    loading: ovLoading,
    error: ovError,
    refetch: ovRefetch,
  } = useDashboardOverview(id);

  const loading = repoLoading || ovLoading;
  const error = repoError || ovError;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard…" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage
          message={error}
          onRetry={() => {
            repoRefetch();
            ovRefetch();
          }}
        />
      </div>
    );

  const commitChart = {
    labels: overview?.commit_activity?.labels || [],
    datasets: [
      {
        label: "Commits",
        data: overview?.commit_activity?.values || [],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.10)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#6366f1",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const langKeys = Object.keys(overview?.language_distribution || {});
  const langValues = Object.values(overview?.language_distribution || {});
  const langChart = {
    labels: langKeys,
    datasets: [
      {
        data: langValues,
        backgroundColor: PALETTE.slice(0, langKeys.length),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const catKeys = Object.keys(overview?.event_categories || {});
  const catValues = Object.values(overview?.event_categories || {});
  const catChart = {
    labels: catKeys,
    datasets: [
      {
        label: "Events",
        data: catValues,
        backgroundColor: PALETTE.slice(0, catKeys.length).map((c) => c + "cc"),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };
  const catOpts = {
    ...lineOpts,
    indexAxis: "y",
    plugins: { legend: { display: false }, tooltip: tooltipTheme },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor, font: tickFont },
        beginAtZero: true,
      },
      y: {
        grid: { display: false },
        ticks: { color: tickColor, font: { size: 10 } },
      },
    },
  };

  const topContributors = overview?.top_contributors || [];
  const topModules = overview?.top_modules || [];
  const recentEvents = overview?.recent_events || [];

  return (
    <div className="min-h-screen bg-dark-950 p-6 lg:p-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-dark-500 mb-2 uppercase tracking-wider font-medium">
              <GitBranch className="h-3.5 w-3.5" />
              Repository Dashboard
            </div>
            <h1 className="text-3xl font-bold text-white">
              {repo?.owner}/{repo?.name}
            </h1>
            {repo?.description && (
              <p className="text-dark-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
                {repo.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {repo?.primary_language && (
                <span className="badge-blue">{repo.primary_language}</span>
              )}
              {repo?.default_branch && (
                <span className="flex items-center gap-1.5 text-xs text-dark-500">
                  <GitBranch className="h-3.5 w-3.5" />
                  {repo.default_branch}
                </span>
              )}
              {repo?.github_url && (
                <a
                  href={repo.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary-400
                    hover:text-primary-300 transition-colors"
                >
                  View on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/dashboard/${id}/analytics`}
              className="btn-secondary text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              to={`/dashboard/${id}/contributors`}
              className="btn-secondary text-sm"
            >
              <Users className="h-4 w-4" />
              Contributors
            </Link>
            <Link to={`/dashboard/${id}/ai`} className="btn-primary text-sm">
              <Bot className="h-4 w-4" />
              AI Assistant
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard
          title="Total Commits"
          value={formatNumber(overview?.total_commits)}
          icon={GitCommit}
          color="primary"
          subtitle={`across ${overview?.total_branches || 0} branches`}
        />
        <StatCard
          title="Contributors"
          value={formatNumber(overview?.total_contributors)}
          icon={Users}
          color="emerald"
          subtitle="unique authors"
        />
        <StatCard
          title="Files Tracked"
          value={formatNumber(overview?.total_files)}
          icon={Folder}
          color="purple"
          subtitle="in repository history"
        />
        <StatCard
          title="Active Since"
          value={formatDate(overview?.first_commit_date)}
          icon={Calendar}
          color="orange"
          subtitle={formatRelativeTime(overview?.first_commit_date)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card animate-slide-up animation-delay-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Commit Activity</h2>
              <p className="section-subtitle">Monthly commit frequency</p>
            </div>
            <Activity className="h-5 w-5 text-primary-400" />
          </div>
          <div className="h-52">
            {commitChart.labels.length > 0 ? (
              <Line data={commitChart} options={lineOpts} />
            ) : (
              <NoData />
            )}
          </div>
        </div>

        <div className="card animate-slide-up animation-delay-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Languages</h2>
              <p className="section-subtitle">By file count</p>
            </div>
            <Code2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="h-44">
            {langKeys.length > 0 ? (
              <Doughnut data={langChart} options={doughnutOpts} />
            ) : (
              <NoData />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card animate-slide-up animation-delay-400">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Engineering Events</h2>
              <p className="section-subtitle">By category</p>
            </div>
            <Zap className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="h-48">
            {catKeys.length > 0 ? (
              <Bar data={catChart} options={catOpts} />
            ) : (
              <NoData />
            )}
          </div>
        </div>

        <div className="card animate-slide-up animation-delay-400">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Top Contributors</h2>
              <p className="section-subtitle">By commit count</p>
            </div>
            <Users className="h-5 w-5 text-primary-400" />
          </div>
          <div className="space-y-3">
            {topContributors.length > 0 ? (
              topContributors.slice(0, 6).map((c, i) => {
                const maxC = topContributors[0]?.commit_count || 1;
                const pct = Math.round((c.commit_count / maxC) * 100);
                const letter = (c.name || c.email || "?")[0].toUpperCase();
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full bg-gradient-to-br
                        from-primary-500 to-primary-700 flex items-center
                        justify-center text-xs font-bold text-white flex-shrink-0"
                    >
                      {letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-200 font-medium truncate">
                        {c.name || c.email || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-dark-700 rounded-full">
                          <div
                            className="h-1 bg-primary-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-dark-500 flex-shrink-0">
                          {formatNumber(c.commit_count)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-dark-600 text-sm">No contributor data</p>
            )}
          </div>
        </div>

        <div className="card animate-slide-up animation-delay-400">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Active Modules</h2>
              <p className="section-subtitle">Most frequently changed</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-3">
            {topModules.length > 0 ? (
              topModules.slice(0, 6).map((m, i) => {
                const maxM = topModules[0]?.change_count || 1;
                const pct = Math.round((m.change_count / maxM) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-200 font-medium truncate">
                        {m.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-dark-700 rounded-full">
                          <div
                            className="h-1 bg-emerald-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-dark-500 flex-shrink-0">
                          {formatNumber(m.change_count)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-dark-600 text-sm">No module data</p>
            )}
          </div>
        </div>
      </div>

      <div className="card animate-slide-up animation-delay-400">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Recent Engineering Events</h2>
            <p className="section-subtitle">
              Latest classified development activities
            </p>
          </div>
          <Link
            to={`/dashboard/${id}/analytics`}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentEvents.length > 0 ? (
          <div className="space-y-2">
            {recentEvents.map((event, i) => {
              const c = getCategoryColor(event.event_type);
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl
                    bg-dark-800/50 border border-dark-700/50
                    hover:border-dark-600 transition-colors"
                >
                  <span
                    className={`badge ${c.bg} ${c.text} flex-shrink-0 mt-0.5`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                    {event.event_type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-200 truncate font-medium">
                      {event.summary || event.commit_message || "—"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-dark-500">
                        {event.module || "Unknown"}
                      </span>
                      <span className="text-dark-700">·</span>
                      <span className="text-xs text-dark-500">
                        {event.author_name || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-dark-700 flex-shrink-0 mt-0.5 whitespace-nowrap">
                    {formatDate(event.event_date)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-dark-600 text-sm">No engineering events found.</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-slide-up animation-delay-400">
        {[
          { label: "Owner", value: repo?.owner },
          { label: "Default Branch", value: repo?.default_branch || "main" },
          {
            label: "Primary Language",
            value: repo?.primary_language || "Unknown",
          },
          { label: "Analysed", value: formatRelativeTime(repo?.completed_at) },
        ].map((item) => (
          <div key={item.label} className="card py-4">
            <p className="text-xs text-dark-500 mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-dark-200">
              {item.value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
