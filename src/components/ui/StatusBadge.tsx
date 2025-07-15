import React from 'react';

export const StatusBadge: React.FC<{ status: 'draft' | 'published' | 'archived' }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          icon: '📝'
        };
      case 'published':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-300',
          icon: '✅'
        };
      case 'archived':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-300',
          icon: '📦'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
      <span className="text-xs">{config.icon}</span>
      {label}
    </span>
  );
}; 