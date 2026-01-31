
import React from 'react';
import { GitHubRepo, AIAnalysis } from '../types';

interface RepoCardProps {
  repo: GitHubRepo;
  isSelected: boolean;
  onToggle: (id: number) => void;
  analysis?: AIAnalysis;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, isSelected, onToggle, analysis }) => {
  const lastUpdated = new Date(repo.updated_at).toLocaleDateString();
  
  const getBadgeStyles = (rec?: string) => {
    switch (rec) {
      case 'DELETE': return 'bg-red-50 text-red-700 border-red-100';
      case 'KEEP': return 'bg-green-50 text-green-700 border-green-100';
      case 'MAYBE': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div 
      onClick={() => onToggle(repo.id)}
      className={`group relative p-5 bg-white rounded-xl border transition-all cursor-pointer tech-shadow hover:tech-shadow-lg ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
        }`}>
          {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 truncate text-sm">
              {repo.name}
            </h3>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">
              {lastUpdated}
            </span>
          </div>
          
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8 leading-relaxed">
            {repo.description || "无项目描述内容。"}
          </p>
          
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-gray-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              {repo.stargazers_count}
            </span>
            <a 
              href={repo.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              GitHub 仓库 ↗
            </a>
          </div>

          {analysis && (
            <div className={`mt-4 p-3 rounded-lg border text-[11px] leading-relaxed transition-all ${getBadgeStyles(analysis.recommendation)}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-white/50 border border-current/20">
                  {analysis.recommendation === 'DELETE' ? '建议删除' : analysis.recommendation === 'KEEP' ? '建议保留' : '待定'}
                </span>
              </div>
              <p className="font-medium opacity-90">{analysis.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoCard;
