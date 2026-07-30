import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GitBranch,
  Search,
  Zap,
  BarChart3,
  Bot,
  Users,
  ArrowRight,
  Github,
  AlertCircle,
  GitCommit,
  TrendingUp,
  Shield,
  Star,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import repositoryService from "../services/repositoryService";
import LoadingSpinner from "../components/LoadingSpinner";

const features = [
  {
    icon: GitBranch,
    title: "Repository Mining",
    desc: "Automatically extract every commit, contributor, branch, tag, and file change from any public GitHub repository.",
    color: "text-primary-400",
    bg: "bg-primary-500/10",
    border: "border-primary-500/20",
  },
  {
    icon: BarChart3,
    title: "Engineering Analytics",
    desc: "Generate commit frequency, module activity, repository growth, language distribution, and contributor rankings.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Bot,
    title: "AI Engineering Assistant",
    desc: "Ask natural-language questions about the repository and receive intelligent, evidence-based engineering explanations.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Users,
    title: "Contributor Intelligence",
    desc: "Understand who contributes what, when they were active, and which modules each developer owns.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: TrendingUp,
    title: "Evolution Tracking",
    desc: "Visualise how the project grew over time with release timelines, growth curves, and development phase analysis.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    icon: Shield,
    title: "Engineering Events",
    desc: "Classify every commit as a Feature, Bug Fix, Refactoring, Documentation, Test, or Release engineering event.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
];

const steps = [
  { step: "01", title: "Submit", desc: "Provide a public GitHub URL" },
  { step: "02", title: "Clone", desc: "Repository is cloned locally" },
  { step: "03", title: "Mine", desc: "All Git history is extracted" },
  { step: "04", title: "Classify", desc: "Commits become engineering events" },
  {
    step: "05",
    title: "Analyse",
    desc: "Metrics and analytics are calculated",
  },
  { step: "06", title: "Store", desc: "Knowledge saved to the database" },
  { step: "07", title: "Visualise", desc: "Explore via interactive dashboard" },
];

const examples = [
  { label: "facebook/react", url: "https://github.com/facebook/react" },
  { label: "vuejs/vue", url: "https://github.com/vuejs/vue" },
  { label: "django/django", url: "https://github.com/django/django" },
  { label: "expressjs/express", url: "https://github.com/expressjs/express" },
];

const stats = [
  { value: "7", label: "Analysis Stages" },
  { value: "AI", label: "Powered Insights" },
  { value: "100%", label: "Open Source" },
  { value: "∞", label: "Repositories" },
];

const isValidGitHubUrl = (url) =>
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/)?$/.test(url.trim());

const HomePage = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    if (!isValidGitHubUrl(trimmed)) {
      setError("Enter a valid GitHub URL — e.g. https://github.com/owner/repo");
      return;
    }

    setLoading(true);
    try {
      const res = await repositoryService.analyzeRepository(trimmed);
      toast.success("Repository submitted! Analysis starting…");
      navigate(`/analysis/${res.analysis_id}`);
    } catch (err) {
      setError(err.message || "Failed to submit repository. Please try again.");
      toast.error("Failed to submit repository");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-dark-950/80 to-dark-950 pointer-events-none" />
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px]
          bg-primary-600/8 rounded-full blur-3xl pointer-events-none"
        />
        <div
          className="absolute top-20 right-0 w-[400px] h-[400px]
          bg-purple-600/6 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-primary-500/10 border border-primary-500/20 text-primary-400
            text-sm font-medium mb-8 animate-fade-in"
          >
            <Zap className="h-3.5 w-3.5" />
            Software Engineering Intelligence System
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold
            text-white leading-[1.08] tracking-tight mb-6 animate-slide-up"
          >
            Understand Any <span className="gradient-text">Git Repository</span>
            <br />
            Intelligently
          </h1>

          <p
            className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto
            mb-12 leading-relaxed animate-slide-up animation-delay-200"
          >
            Transform raw Git history into structured engineering knowledge.
            Mine repositories, calculate analytics, and get AI-powered insights
            — all in one platform.
          </p>

          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto animate-slide-up animation-delay-400"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500 pointer-events-none" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  placeholder="https://github.com/owner/repository"
                  className="input pl-12 h-14 text-base rounded-xl"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary h-14 px-8 text-base rounded-xl whitespace-nowrap"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Analyse Repository
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="flex items-center gap-2 mt-3 text-red-400 text-sm text-left">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-5">
              <span className="text-dark-600 text-sm">Try:</span>
              {examples.map((ex) => (
                <button
                  key={ex.url}
                  type="button"
                  onClick={() => {
                    setUrl(ex.url);
                    setError("");
                  }}
                  disabled={loading}
                  className="text-sm text-primary-400 hover:text-primary-300
                    transition-colors hover:underline underline-offset-2"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      <section className="border-y border-dark-800 bg-dark-900/50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold gradient-text">
                  {s.value}
                </p>
                <p className="text-dark-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Understand a Repository
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto text-lg">
            SEIS combines repository mining, engineering analytics, and
            artificial intelligence into a single platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`card border ${f.border} hover:shadow-lg
                  transition-all duration-200 group cursor-default`}
              >
                <div className={`inline-flex p-3 rounded-xl ${f.bg} mb-4`}>
                  <Icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-dark-900/40 border-y border-dark-800">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-dark-400 text-lg">
              A seven-stage pipeline transforms your repository into engineering
              intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {steps.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-3">
                  <div
                    className="w-12 h-12 rounded-full bg-dark-800 border-2
                      border-primary-500/30 group-hover:border-primary-500
                      flex items-center justify-center text-primary-400
                      text-sm font-bold transition-all duration-200
                      group-hover:bg-primary-600/15"
                  >
                    {s.step}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="absolute top-6 left-12 w-full h-px bg-dark-700
                      hidden lg:block"
                    />
                  )}
                </div>
                <p className="text-white font-semibold text-sm">{s.title}</p>
                <p className="text-dark-500 text-xs mt-1 leading-tight">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div
          className="card bg-gradient-to-br from-primary-900/30 to-purple-900/20
          border-primary-500/20 py-14 px-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Analyse Your Repository?
          </h2>
          <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
            Submit any public GitHub repository and receive a complete
            engineering intelligence report in minutes.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="btn-primary text-base px-10 py-3 rounded-xl mx-auto"
          >
            Get Started
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
