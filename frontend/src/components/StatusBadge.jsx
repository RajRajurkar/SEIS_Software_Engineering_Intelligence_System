import { getStatusColor } from '../utils/formatters';

const StatusBadge = ({ status }) => {
  const colors = getStatusColor(status);

  const dots = {
    pending:   'animate-pulse',
    running:   'animate-pulse',
    completed: '',
    failed:    '',
  };

  return (
    <span className={`badge ${colors.bg} ${colors.text}`}>
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          status === 'completed' ? 'bg-emerald-400' :
          status === 'failed'    ? 'bg-red-400' :
          status === 'running'   ? 'bg-blue-400' :
          'bg-yellow-400'
        } ${dots[status?.toLowerCase()] || ''}`}
      />
      {colors.label}
    </span>
  );
};

export default StatusBadge;