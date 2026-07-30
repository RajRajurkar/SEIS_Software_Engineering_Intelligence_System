import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  BarChart3,
  Users,
  Bot,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Plus,
} from "lucide-react";
import BackendStatus from "../components/BackendStatus";

const buildNav = (analysisId) => [
  {
    section: "Main",
    items: [
      { path: "/", icon: LayoutDashboard, label: "Home" },
      { path: "/repositories", icon: GitBranch, label: "Repositories" },
      { path: "/history", icon: History, label: "History" },
    ],
  },
  ...(analysisId
    ? [
        {
          section: "Current Repository",
          items: [
            {
              path: `/dashboard/${analysisId}`,
              icon: LayoutDashboard,
              label: "Dashboard",
            },
            {
              path: `/dashboard/${analysisId}/analytics`,
              icon: BarChart3,
              label: "Analytics",
            },
            {
              path: `/dashboard/${analysisId}/contributors`,
              icon: Users,
              label: "Contributors",
            },
            {
              path: `/dashboard/${analysisId}/ai`,
              icon: Bot,
              label: "AI Assistant",
            },
          ],
        },
      ]
    : []),
  {
    section: "System",
    items: [{ path: "/settings", icon: Settings, label: "Settings" }],
  },
];

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const analysisIdMatch =
    location.pathname.match(/\/dashboard\/([a-f0-9-]{36})/) ||
    location.pathname.match(/\/analysis\/([a-f0-9-]{36})/);
  const analysisId = analysisIdMatch ? analysisIdMatch[1] : null;

  const navGroups = buildNav(analysisId);

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <aside
        className={`
          ${collapsed ? "w-[68px]" : "w-64"}
          flex-shrink-0 bg-dark-900 border-r border-dark-800
          transition-all duration-300 ease-in-out
          flex flex-col z-20
        `}
      >
        <div
          className={`
            flex items-center ${collapsed ? "justify-center px-3" : "gap-3 px-5"}
            py-5 border-b border-dark-800 flex-shrink-0
          `}
        >
          <div
            onClick={() => navigate("/")}
            className="flex-shrink-0 p-2 bg-gradient-to-br from-primary-500
              to-primary-700 rounded-xl shadow-lg shadow-primary-500/20 cursor-pointer"
          >
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div
              className="min-w-0 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <h1 className="text-sm font-bold text-white leading-tight tracking-wide">
                SEIS
              </h1>
              <p className="text-[10px] text-dark-500 truncate leading-tight">
                Engineering Intelligence
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <p
                  className="text-[10px] font-semibold text-dark-600
                  uppercase tracking-widest px-3 mb-1.5"
                >
                  {group.section}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : ""}
                      className={`
                        flex items-center
                        ${collapsed ? "justify-center px-0" : "gap-3 px-3"}
                        py-2.5 rounded-xl transition-all duration-150 group border
                        ${
                          active
                            ? "bg-primary-600/15 text-primary-400 border-primary-500/25"
                            : "text-dark-400 hover:text-dark-200 hover:bg-dark-800 border-transparent"
                        }
                      `}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] flex-shrink-0 transition-colors
                          ${
                            active
                              ? "text-primary-400"
                              : "text-dark-500 group-hover:text-dark-300"
                          }`}
                      />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium truncate flex-1">
                            {item.label}
                          </span>
                          {active && (
                            <span
                              className="h-1.5 w-1.5 rounded-full
                              bg-primary-400 flex-shrink-0"
                            />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0 p-3 border-t border-dark-800 space-y-2">
          {!collapsed && (
            <button
              onClick={() => navigate("/")}
              className="w-full btn-primary text-xs py-2 justify-center"
            >
              <Plus className="h-3.5 w-3.5" />
              New Analysis
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center
              ${collapsed ? "justify-center" : "gap-2 justify-start px-2"}
              py-2 rounded-xl text-dark-500 hover:text-dark-300
              hover:bg-dark-800 transition-all duration-150`}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex-shrink-0 h-12 bg-dark-900/80 border-b
          border-dark-800 backdrop-blur flex items-center justify-between px-5"
        >
          <div className="flex items-center gap-3">
            <p className="text-xs text-dark-600 hidden sm:block">
              {location.pathname === "/"
                ? "Home"
                : location.pathname.split("/").filter(Boolean).join(" / ")}
            </p>
          </div>
          <BackendStatus />
        </header>

        <main className="flex-1 overflow-y-auto bg-dark-950">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
