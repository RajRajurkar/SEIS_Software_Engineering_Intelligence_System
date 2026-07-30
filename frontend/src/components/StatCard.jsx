const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
  trend,
}) => {
  const colors = {
    primary: { icon: "text-primary-400", bg: "bg-primary-500/10" },
    emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10" },
    purple: { icon: "text-purple-400", bg: "bg-purple-500/10" },
    orange: { icon: "text-orange-400", bg: "bg-orange-500/10" },
    red: { icon: "text-red-400", bg: "bg-red-500/10" },
    yellow: { icon: "text-yellow-400", bg: "bg-yellow-500/10" },
  };

  const colorSet = colors[color] || colors.primary;

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-dark-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-dark-50 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-dark-500 mt-1">{subtitle}</p>}
          {trend && (
            <p
              className={`text-xs mt-1 font-medium ${
                trend.direction === "up"
                  ? "text-emerald-400"
                  : trend.direction === "down"
                    ? "text-red-400"
                    : "text-dark-400"
              }`}
            >
              {trend.direction === "up"
                ? "↑"
                : trend.direction === "down"
                  ? "↓"
                  : "→"}{" "}
              {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorSet.bg}`}>
            <Icon className={`h-5 w-5 ${colorSet.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
