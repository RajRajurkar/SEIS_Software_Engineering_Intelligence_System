import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  GitBranch,
  Clock,
  ExternalLink,
  RotateCcw,
  Home,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRepositoryStatus } from "../hooks/useRepository";
import { useApp } from "../context/AppContext";
import { formatDateTime } from "../utils/formatters";

const STAGES = [
  {
    key: "cloning",
    label: "Cloning Repository",
    desc: "Downloading repository from GitHub.",
  },
  {
    key: "mining",
    label: "Mining Repository",
    desc: "Extracting commits, contributors, branches, tags, and file changes.",
  },
  {
    key: "processing",
    label: "Processing Engineering Events",
    desc: "Classifying commits into features, bug fixes, refactoring, and more.",
  },
  {
    key: "analytics",
    label: "Calculating Analytics",
    desc: "Computing repository metrics, module activity, and contributor statistics.",
  },
  {
    key: "storing",
    label: "Storing Engineering Knowledge",
    desc: "Persisting all structured knowledge to the database.",
  },
  {
    key: "ai",
    label: "Generating AI Insights",
    desc: "Building repository summary and initial AI insights.",
  },
  {
    key: "completed",
    label: "Analysis Complete",
    desc: "All stages finished. Redirecting to dashboard…",
  },
];

const stageIndex = (status, currentStage) => {
  if (status === "completed") return STAGES.length;
  if (status === "failed") return -1;
  const i = STAGES.findIndex((s) => s.key === currentStage);
  return i >= 0 ? i : 0;
};

const StageRow = ({ stage, index, currentIndex, status }) => {
  const done = currentIndex > index || status === "completed";
  const active = currentIndex === index && status === "running";
  const failed = status === "failed" && currentIndex === index;
  const pending = !done && !active && !failed;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300
      ${active ? "bg-primary-600/10  border-primary-500/30" : ""}
      ${done ? "bg-emerald-500/5   border-emerald-500/20" : ""}
      ${failed ? "bg-red-500/10      border-red-500/30" : ""}
      ${pending ? "bg-dark-800/40     border-dark-700/50" : ""}
    `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {failed && <XCircle className="h-5 w-5 text-red-400" />}
        {done && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        {active && (
          <Loader2 className="h-5 w-5 text-primary-400 animate-spin" />
        )}
        {pending && <Circle className="h-5 w-5 text-dark-700" />}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold
          ${active ? "text-primary-300" : ""}
          ${done ? "text-emerald-300" : ""}
          ${failed ? "text-red-300" : ""}
          ${pending ? "text-dark-600" : ""}
        `}
        >
          {stage.label}
        </p>
        <p className="text-xs text-dark-500 mt-0.5 leading-relaxed">
          {stage.desc}
        </p>
      </div>
      <span
        className={`flex-shrink-0 text-xs font-mono px-2 py-0.5 rounded-full
        ${active ? "bg-primary-500/20 text-primary-400" : ""}
        ${done ? "bg-emerald-500/20 text-emerald-400" : ""}
        ${failed ? "bg-red-500/20     text-red-400" : ""}
        ${pending ? "bg-dark-800       text-dark-700" : ""}
      `}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
};

const AnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAnalysis } = useApp();

  const { data, loading } = useRepositoryStatus(id, {
    onComplete: (res) => {
      setAnalysis(id);
      toast.success("Analysis complete! Loading dashboard…");
      setTimeout(() => navigate(`/dashboard/${id}`), 1500);
    },
    onFail: (res) => {
      toast.error("Analysis failed. Please try again.");
    },
  });

  const currIdx = data ? stageIndex(data.status, data.current_stage) : 0;
  const progress =
    data?.status === "completed"
      ? 100
      : data?.status === "failed"
        ? 0
        : Math.round(((currIdx + 0.5) / STAGES.length) * 100);

  const repoLabel =
    data?.repository_name ||
    data?.github_url?.replace("https://github.com/", "") ||
    "Analysing…";

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm">
            Connecting to analysis pipeline…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-dark-500 mb-3">
            <GitBranch className="h-4 w-4" />
            Repository Analysis
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 break-all">
            {repoLabel}
          </h1>
          {data?.github_url && (
            <a
              href={data.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm
                text-primary-400 hover:text-primary-300 transition-colors"
            >
              {data.github_url}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="card mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-dark-500 mb-1 uppercase tracking-wider font-medium">
                Overall Progress
              </p>
              <p className="text-3xl font-bold text-white">{progress}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-dark-500 mb-1 uppercase tracking-wider font-medium">
                Status
              </p>
              <div className="flex items-center gap-2 justify-end">
                {data?.status === "running" && (
                  <Loader2 className="h-4 w-4 text-primary-400 animate-spin" />
                )}
                {data?.status === "completed" && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
                {data?.status === "failed" && (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-semibold capitalize
                  ${data?.status === "running" ? "text-primary-300" : ""}
                  ${data?.status === "completed" ? "text-emerald-300" : ""}
                  ${data?.status === "failed" ? "text-red-300" : ""}
                  ${data?.status === "pending" ? "text-yellow-300" : ""}
                `}
                >
                  {data?.status || "Pending"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out
                ${
                  data?.status === "failed"
                    ? "bg-red-500"
                    : "bg-gradient-to-r from-primary-600 to-primary-400"
                }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {data?.started_at && (
            <div className="flex items-center gap-2 mt-4 text-xs text-dark-600">
              <Clock className="h-3.5 w-3.5" />
              Started: {formatDateTime(data.started_at)}
            </div>
          )}
        </div>

        <div className="space-y-2.5 animate-slide-up animation-delay-200">
          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-4">
            Analysis Pipeline
          </p>
          {STAGES.map((stage, i) => (
            <StageRow
              key={stage.key}
              stage={stage}
              index={i}
              currentIndex={currIdx}
              status={data?.status || "pending"}
            />
          ))}
        </div>

        {data?.status === "failed" && (
          <div className="mt-8 card border-red-500/30 bg-red-500/5 animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-semibold mb-1">
                  Analysis Failed
                </p>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {data?.error_message ||
                    "An unexpected error occurred. Please verify the repository URL and try again."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="btn-primary text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </button>
              <Link to="/" className="btn-secondary text-sm">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
        )}

        {data?.status === "completed" && (
          <div className="mt-8 card border-emerald-500/30 bg-emerald-500/5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <div>
                  <p className="text-emerald-300 font-semibold">
                    Analysis Complete
                  </p>
                  <p className="text-dark-400 text-sm">
                    Redirecting to dashboard…
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/dashboard/${id}`)}
                className="btn-primary text-sm"
              >
                Open Dashboard
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
