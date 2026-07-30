export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat().format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
};

export const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getCategoryColor = (category) => {
  const colors = {
    Feature: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
    },
    "Bug Fix": { bg: "bg-red-500/20", text: "text-red-300", dot: "bg-red-400" },
    Refactoring: {
      bg: "bg-blue-500/20",
      text: "text-blue-300",
      dot: "bg-blue-400",
    },
    Documentation: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-300",
      dot: "bg-yellow-400",
    },
    Testing: {
      bg: "bg-purple-500/20",
      text: "text-purple-300",
      dot: "bg-purple-400",
    },
    Configuration: {
      bg: "bg-gray-500/20",
      text: "text-gray-300",
      dot: "bg-gray-400",
    },
    "Dependency Update": {
      bg: "bg-orange-500/20",
      text: "text-orange-300",
      dot: "bg-orange-400",
    },
    Release: {
      bg: "bg-pink-500/20",
      text: "text-pink-300",
      dot: "bg-pink-400",
    },
  };
  return (
    colors[category] || {
      bg: "bg-dark-700",
      text: "text-dark-400",
      dot: "bg-dark-500",
    }
  );
};

export const getStatusColor = (status) => {
  const colors = {
    pending: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-300",
      label: "Pending",
    },
    running: { bg: "bg-blue-500/20", text: "text-blue-300", label: "Running" },
    completed: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-300",
      label: "Completed",
    },
    failed: { bg: "bg-red-500/20", text: "text-red-300", label: "Failed" },
  };
  return colors[status?.toLowerCase()] || colors.pending;
};

export const extractRepoName = (url) => {
  if (!url) return "Unknown";
  const parts = url.replace("https://github.com/", "").split("/");
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : url;
};

export const getInitials = (name) => {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const stringToColor = (str) => {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-teal-500 to-teal-600",
    "from-red-500 to-red-600",
  ];
  if (!str) return colors[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
