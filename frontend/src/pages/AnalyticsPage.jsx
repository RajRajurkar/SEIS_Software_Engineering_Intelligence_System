import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Zap,
  GitCommit,
  Folder,
  Code2,
  Star,
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
import analyticsService from "../services/analyticsService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import StatCard from "../components/StatCard";
import {
  formatNumber,
  formatDate,
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

const baseOptions = (horizontal = false) => ({
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
  ...(horizontal ? { indexAxis: "y" } : {}),
  scales: {
    x: {
      grid: { color: "#1e293b" },
      ticks: { color: "#64748b", font: { size: 11 } },
    },
    y: {
      grid: { color: "#1e293b" },
      ticks: { color: "#64748b", font: { size: 11 } },
      beginAtZero: true,
    },
  },
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: {
      display: true,
      position: "right",
      labels: {
        color: "#64748b",
        font: { size: 11 },
        boxWidth: 10,
        padding: 12,
      },
    },
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

const ChartCard = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
  height = "h-60",
}) => (
  <div className="card animate-slide-up">
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="section-title">{title}</h3>
        {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
      </div>
      {Icon && (
        <Icon className={`h-5 w-5 ${iconColor || "text-primary-400"}`} />
      )}
    </div>
    <div className={height}>{children}</div>
  </div>
);

const NoData = () => (
  <div className="h-full flex items-center justify-center">
    <p className="text-dark-500 text-sm">No data available</p>
  </div>
);

const AnalyticsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await analyticsService.getRepositoryAnalytics(id);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
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
        <LoadingSpinner size="lg" text="Loading analytics…" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );

  /*  build chart datasets  */

  const commitTimeline = {
    labels: data?.commit_timeline?.labels || [],
    datasets: [
      {
        label: "Commits",
        data: data?.commit_timeline?.values || [],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.12)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#6366f1",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const growthChart = {
    labels: data?.repository_growth?.labels || [],
    datasets: [
      {
        label: "Total Commits",
        data: data?.repository_growth?.values || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.1)",
        borderWidth: 2,
        pointRadius: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const insertDelChart = {
    labels: data?.insertions_deletions?.labels || [],
    datasets: [
      {
        label: "Insertions",
        data: data?.insertions_deletions?.insertions || [],
        backgroundColor: "rgba(16,185,129,0.75)",
        borderRadius: 4,
      },
      {
        label: "Deletions",
        data: data?.insertions_deletions?.deletions || [],
        backgroundColor: "rgba(239,68,68,0.75)",
        borderRadius: 4,
      },
    ],
  };

  const langKeys = Object.keys(data?.language_distribution || {});
  const langValues = Object.values(data?.language_distribution || {});
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

  const catKeys = Object.keys(data?.event_categories || {});
  const catValues = Object.values(data?.event_categories || {});
  const catChart = {
    labels: catKeys,
    datasets: [
      {
        data: catValues,
        backgroundColor: PALETTE.slice(0, catKeys.length),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const modModules = data?.module_activity || [];
  const moduleChart = {
    labels: modModules.map((m) => m.name),
    datasets: [
      {
        label: "Changes",
        data: modModules.map((m) => m.change_count),
        backgroundColor: "rgba(99,102,241,0.75)",
        borderRadius: 6,
      },
    ],
  };

  const dowChart = {
    labels: data?.commits_by_day || [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    datasets: [
      {
        label: "Commits",
        data: data?.commits_by_day_values || [],
        backgroundColor: "rgba(99,102,241,0.75)",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-dark-950 p-6 lg:p-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-dark-500 mb-2">
          <BarChart3 className="h-4 w-4" />
          Repository Analytics
        </div>
        <h1 className="text-3xl font-bold text-white">Analytics Overview</h1>
        <p className="text-dark-400 text-sm mt-1">
          Comprehensive engineering metrics extracted from repository history.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard
          title="Total Commits"
          value={formatNumber(data?.total_commits)}
          icon={GitCommit}
          color="primary"
        />
        <StatCard
          title="Total Insertions"
          value={formatNumber(data?.total_insertions)}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Deletions"
          value={formatNumber(data?.total_deletions)}
          icon={TrendingUp}
          color="red"
        />
        <StatCard
          title="Files Tracked"
          value={formatNumber(data?.total_files)}
          icon={Folder}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Commit Timeline"
          subtitle="Monthly commit frequency"
          icon={Calendar}
          iconColor="text-primary-400"
        >
          {commitTimeline.labels.length > 0 ? (
            <Line data={commitTimeline} options={baseOptions()} />
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard
          title="Repository Growth"
          subtitle="Cumulative commit count over time"
          icon={TrendingUp}
          iconColor="text-emerald-400"
        >
          {growthChart.labels.length > 0 ? (
            <Line data={growthChart} options={baseOptions()} />
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard
          title="Insertions vs Deletions"
          subtitle="Code additions and removals per month"
          icon={Code2}
          iconColor="text-yellow-400"
        >
          {insertDelChart.labels.length > 0 ? (
            <Bar
              data={insertDelChart}
              options={{
                ...baseOptions(),
                plugins: {
                  ...baseOptions().plugins,
                  legend: {
                    display: true,
                    labels: {
                      color: "#64748b",
                      font: { size: 11 },
                      boxWidth: 10,
                    },
                  },
                },
              }}
            />
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard
          title="Module Activity"
          subtitle="Most frequently changed modules"
          icon={Folder}
          iconColor="text-purple-400"
        >
          {modModules.length > 0 ? (
            <Bar data={moduleChart} options={baseOptions(true)} />
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard
          title="Language Distribution"
          subtitle="Percentage breakdown"
          icon={Code2}
          iconColor="text-emerald-400"
          height="h-52"
        >
          {langKeys.length > 0 ? (
            <Doughnut data={langChart} options={doughnutOptions} />
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard
          title="Engineering Events"
          subtitle="Commit classification breakdown"
          icon={Zap}
          iconColor="text-yellow-400"
          height="h-52"
        >
          {catKeys.length > 0 ? (
            <Doughnut data={catChart} options={doughnutOptions} />
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard
          title="Activity by Day"
          subtitle="Commits per day of week"
          icon={Calendar}
          iconColor="text-orange-400"
          height="h-52"
        >
          {data?.commits_by_day_values?.length > 0 ? (
            <Bar data={dowChart} options={baseOptions()} />
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="section-title">File Hotspots</h3>
            <p className="section-subtitle">Files modified most frequently</p>
          </div>
          <Star className="h-5 w-5 text-yellow-400" />
        </div>

        {data?.file_hotspots?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-dark-500 font-medium text-xs uppercase tracking-wider">
                    File
                  </th>
                  <th className="text-right py-3 px-4 text-dark-500 font-medium text-xs uppercase tracking-wider">
                    Changes
                  </th>
                  <th className="text-right py-3 px-4 text-dark-500 font-medium text-xs uppercase tracking-wider">
                    Insertions
                  </th>
                  <th className="text-right py-3 px-4 text-dark-500 font-medium text-xs uppercase tracking-wider">
                    Deletions
                  </th>
                  <th className="text-right py-3 px-4 text-dark-500 font-medium text-xs uppercase tracking-wider">
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {data.file_hotspots.map((file, i) => {
                  const maxChanges = data.file_hotspots[0]?.change_count || 1;
                  const pct = Math.round(
                    (file.change_count / maxChanges) * 100,
                  );
                  return (
                    <tr
                      key={i}
                      className="hover:bg-dark-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-dark-200 truncate max-w-xs">
                        {file.file_path}
                      </td>
                      <td className="py-3 px-4 text-right text-dark-300 font-medium">
                        {formatNumber(file.change_count)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 text-xs">
                        +{formatNumber(file.insertions)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-400 text-xs">
                        -{formatNumber(file.deletions)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-dark-700 rounded-full">
                            <div
                              className="h-1.5 bg-primary-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-dark-500 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-dark-500 text-sm">
            No file hotspot data available.
          </p>
        )}
      </div>

      {data?.release_stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-slide-up">
          {[
            {
              label: "Total Releases",
              value: data.release_stats.total_releases,
            },
            {
              label: "Latest Release",
              value: data.release_stats.latest_release,
            },
            { label: "First Release", value: data.release_stats.first_release },
            {
              label: "Avg Days Between Releases",
              value: data.release_stats.avg_days_between_releases
                ? `${data.release_stats.avg_days_between_releases}d`
                : "—",
            },
          ].map((item) => (
            <div key={item.label} className="card">
              <p className="text-xs text-dark-500 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-dark-200">
                {item.value || "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
