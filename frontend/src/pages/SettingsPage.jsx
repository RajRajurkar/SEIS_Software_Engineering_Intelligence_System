import { useState } from "react";
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Key,
  Info,
  Save,
  RotateCcw,
  CheckCircle2,
  Shield,
  Zap,
  Github,
} from "lucide-react";
import toast from "react-hot-toast";

const Section = ({ title, description, icon: Icon, children }) => (
  <div className="card mb-6 animate-fade-in">
    <div className="flex items-start gap-3 mb-6 pb-4 border-b border-dark-800">
      <div className="p-2.5 bg-primary-500/10 rounded-xl flex-shrink-0">
        <Icon className="h-5 w-5 text-primary-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description && (
          <p className="text-sm text-dark-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium text-dark-200">{label}</p>
      {description && (
        <p className="text-xs text-dark-500 mt-0.5">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 focus:outline-none
        ${checked ? "bg-primary-600" : "bg-dark-700"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white
          shadow-lg transition-transform duration-200
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  </div>
);

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    theme: "dark",
    apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
    aiEnabled: true,
    autoAnalyse: false,
    notifications: true,
    cacheResults: true,
    detailedLogs: false,
    aiModel: "gpt-4o-mini",
  });
  const [saved, setSaved] = useState(false);

  const update = (key, val) => setSettings((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    localStorage.setItem("seis_settings", JSON.stringify(settings));
    setSaved(true);
    toast.success("Settings saved");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      theme: "dark",
      apiUrl: "http://localhost:8000",
      aiEnabled: true,
      autoAnalyse: false,
      notifications: true,
      cacheResults: true,
      detailedLogs: false,
      aiModel: "gpt-4o-mini",
    });
    toast("Settings reset to defaults", { icon: "ℹ️" });
  };

  return (
    <div className="min-h-screen bg-dark-950 p-6 lg:p-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-dark-500 mb-2">
          <Settings className="h-4 w-4" />
          Settings
        </div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 text-sm mt-1">
          Configure the Software Engineering Intelligence System
        </p>
      </div>

      <Section
        icon={Moon}
        title="Appearance"
        description="Customise how the interface looks"
      >
        <div className="space-y-1 divide-y divide-dark-800">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-dark-200">Theme</p>
              <p className="text-xs text-dark-500 mt-0.5">
                Choose your preferred colour scheme
              </p>
            </div>
            <div className="flex gap-2">
              {["dark", "light"].map((t) => (
                <button
                  key={t}
                  onClick={() => update("theme", t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                    capitalize border transition-all
                    ${
                      settings.theme === t
                        ? "bg-primary-600/20 text-primary-400 border-primary-500/30"
                        : "bg-dark-800 text-dark-400 border-dark-700 hover:text-dark-200"
                    }`}
                >
                  {t === "dark" ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Sun className="h-3.5 w-3.5" />
                  )}
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Toggle
            label="Desktop Notifications"
            description="Show notifications when analysis completes"
            checked={settings.notifications}
            onChange={(v) => update("notifications", v)}
          />
        </div>
      </Section>

      <Section
        icon={Globe}
        title="Backend Connection"
        description="Configure the API server connection"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              API Base URL
            </label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => update("apiUrl", e.target.value)}
              className="input font-mono text-sm"
              placeholder="http://localhost:8000"
            />
            <p className="text-xs text-dark-500 mt-1.5">
              The URL of the FastAPI backend server
            </p>
          </div>

          <Toggle
            label="Cache Analysis Results"
            description="Store results locally to avoid re-fetching"
            checked={settings.cacheResults}
            onChange={(v) => update("cacheResults", v)}
          />
          <Toggle
            label="Detailed Request Logs"
            description="Log all API requests to the browser console"
            checked={settings.detailedLogs}
            onChange={(v) => update("detailedLogs", v)}
          />
        </div>
      </Section>

      <Section
        icon={Zap}
        title="AI Engineering Assistant"
        description="Configure AI-powered features"
      >
        <div className="space-y-1 divide-y divide-dark-800">
          <Toggle
            label="Enable AI Assistant"
            description="Use OpenAI to generate engineering explanations"
            checked={settings.aiEnabled}
            onChange={(v) => update("aiEnabled", v)}
          />

          <div className="py-3">
            <label className="block text-sm font-medium text-dark-300 mb-2">
              AI Model
            </label>
            <select
              value={settings.aiModel}
              onChange={(e) => update("aiModel", e.target.value)}
              disabled={!settings.aiEnabled}
              className="input cursor-pointer disabled:opacity-50"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
              <option value="gpt-4o">GPT-4o (More Capable)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
            </select>
          </div>
        </div>
      </Section>

      <Section
        icon={Info}
        title="About SEIS"
        description="Software Engineering Intelligence System"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Version", value: "1.0.0" },
            { label: "Frontend", value: "React + Vite" },
            { label: "Backend", value: "FastAPI" },
            { label: "Database", value: "PostgreSQL" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-dark-800 rounded-xl p-4 text-center"
            >
              <p className="text-xs text-dark-500 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-dark-200">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-2 p-3 bg-primary-950/40
          border border-primary-500/20 rounded-xl text-sm text-primary-400"
        >
          <Shield className="h-4 w-4 flex-shrink-0" />
          SEIS only analyses <strong>public</strong> repositories. No private
          repository access is required.
        </div>
      </Section>

      <div className="flex gap-3 animate-fade-in">
        <button onClick={handleSave} className="btn-primary">
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
        <button onClick={handleReset} className="btn-secondary">
          <RotateCcw className="h-4 w-4" />
          Reset Defaults
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
