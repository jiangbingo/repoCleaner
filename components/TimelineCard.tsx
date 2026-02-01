import React from 'react';
import { GitHubRepo, AIAnalysis } from '../types';

interface TimelineCardProps {
  repo: GitHubRepo;
  analysis?: AIAnalysis;
  isSelected: boolean;
  onToggle: () => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  repo,
  analysis,
  isSelected,
  onToggle
}) => {
  const getRecommendationBadge = () => {
    if (!analysis) return null;
    switch (analysis.recommendation) {
      case 'DELETE':
        return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">🔴 建议</span>;
      case 'KEEP':
        return <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">🟡 保留</span>;
      case 'HIGH':
        return <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">🟢 高价值</span>;
      default:
        return null;
    }
  };

  const getNodeColor = () => {
    if (!analysis) return 'bg-gray-300';
    switch (analysis.recommendation) {
      case 'DELETE': return 'bg-red-500';
      case 'KEEP': return 'bg-yellow-500';
      case 'HIGH': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div
      className={`relative pl-6 pb-6 cursor-pointer transition-all ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={onToggle}
    >
      {/* 时间轴节点 */}
      <div className={`absolute left-0 top-2 w-3 h-3 rounded-full ${getNodeColor()} ring-4 ring-white shadow-sm`}></div>

      {/* 时间轴线 */}
      <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-gray-200 -z-10"></div>

      {/* 卡片内容 */}
      <div
        className={`bg-white rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-all ${
          isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getRecommendationBadge()}
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-gray-900 hover:text-blue-600 truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {repo.name}
              </a>
            </div>
            <p className="text-xs text-gray-500">{repo.full_name}</p>
          </div>
          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span>📅 {formatDate(repo.created_at)}</span>
        </div>

        {analysis && (
          <>
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="text-gray-600">📚 学习 {analysis.learningValue}/5</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">📖 参考 {analysis.referenceValue}/5</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">🛠️ 实用 {analysis.practicalValue}/5</span>
            </div>
            {analysis.reason && (
              <p className="text-xs text-gray-600 line-clamp-2">💬 {analysis.reason}</p>
            )}
          </>
        )}

        {repo.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-2">{repo.description}</p>
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
