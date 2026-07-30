const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {Icon && (
        <div className="p-4 bg-dark-800 rounded-full mb-4">
          <Icon className="h-8 w-8 text-dark-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-dark-300 mb-2">{title}</h3>
      {description && (
        <p className="text-dark-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyState;
