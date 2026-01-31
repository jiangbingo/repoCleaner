import React from 'react';
import { GitHubRepo, AIAnalysis } from '../types';
import RepoCard from './RepoCard';

type RepoType = 'forks' | 'mine';

interface RepoGridProps {
  repos: GitHubRepo[];
  analyses: Record<number, AIAnalysis>;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  activeTab: RepoType;
}

const RepoGrid: React.FC<RepoGridProps> = ({
  repos,
  analyses,
  selectedIds,
  onToggle,
  activeTab
}) => {
  if (repos.length === 0) {
    return (
      <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        </div>
        <p className="text-gray-400 font-bold">没有找到符合条件的仓库</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map(repo => (
        <RepoCard
          key={repo.id}
          repo={repo}
          isSelected={selectedIds.has(repo.id)}
          onToggle={onToggle}
          analysis={analyses[repo.id]}
          isFork={activeTab === 'forks'}
        />
      ))}
    </div>
  );
};

export default RepoGrid;
