import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-800">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {actions && (
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
};
