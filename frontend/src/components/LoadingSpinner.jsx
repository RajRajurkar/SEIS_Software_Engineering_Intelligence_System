const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`spinner ${sizes[size]}`} />
      {text && (
        <p className="text-dark-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;