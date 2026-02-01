import React from 'react';
import { GitHubRepo, AIAnalysis } from '../types';
import TimelineCard from './TimelineCard';

interface TimelineProps {
  repos: GitHubRepo[];
  analyses: Record<number, AIAnalysis>;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  title: string;
}

const Timeline: React.FC<TimelineProps> = ({
  repos,
  analyses,
  selectedIds,
  onToggle,
  title
}) => {
  if (repos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">暂无仓库</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 h-[600px] flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2">
        {title} <span className="text-sm font-normal text-gray-500">({repos.length})</span>
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
        {repos.map((repo) => (
          <TimelineCard
            key={repo.id}
            repo={repo}
            analysis={analyses[repo.id]}
            isSelected={selectedIds.has(repo.id)}
            onToggle={() => onToggle(repo.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
