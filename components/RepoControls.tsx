import React from 'react';
import { AppState } from '../types';

type RepoType = 'forks' | 'mine';

interface RepoControlsProps {
  activeTab: RepoType;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  status: AppState;
  currentRepos: any[];
  currentSelectedIds: Set<number>;
  onAnalyze: () => void;
  updateSelectedIds: (ids: Set<number>) => void;
}

const RepoControls: React.FC<RepoControlsProps> = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  status,
  currentRepos,
  currentSelectedIds,
  onAnalyze,
  updateSelectedIds
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start mb-10">
      <div className="flex-1 w-full">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder={`搜索您的 ${activeTab === 'forks' ? 'Fork' : '自建'} 项目...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onAnalyze}
              disabled={status === AppState.LOADING || currentRepos.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {status === AppState.LOADING ? '分析中...' : 'AI 智能识别'}
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">已选:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-black rounded-full">{currentSelectedIds.size}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSelectedIds(new Set(currentRepos.map(r => r.id)))}
              className="text-xs font-bold text-gray-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
              全选
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => updateSelectedIds(new Set())}
              className="text-xs font-bold text-gray-500 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              取消全选
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoControls;
