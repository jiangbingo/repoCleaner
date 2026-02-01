import React, { useMemo } from 'react';
import { GitHubRepo, AIAnalysis } from '../types';
import ForksTimeline from './ForksTimeline';
import MineTimeline from './MineTimeline';

interface TimelineContainerProps {
  forks: GitHubRepo[];
  mine: GitHubRepo[];
  forkAnalyses: Record<number, AIAnalysis>;
  mineAnalyses: Record<number, AIAnalysis>;
  selectedForkIds: Set<number>;
  selectedMineIds: Set<number>;
  onToggleFork: (id: number) => void;
  onToggleMine: (id: number) => void;
}

// 排序逻辑
const sortRepos = (repos: GitHubRepo[], analyses: Record<number, AIAnalysis>) => {
  return [...repos].sort((a, b) => {
    const analysisA = analyses[a.id];
    const analysisB = analyses[b.id];

    // 推荐等级优先级
    const priority: Record<string, number> = { 'DELETE': 0, 'KEEP': 1, 'HIGH': 2 };
    const priorityA = analysisA ? priority[analysisA.recommendation] : 1;
    const priorityB = analysisB ? priority[analysisB.recommendation] : 1;

    if (priorityA !== priorityB) return priorityA - priorityB;

    // 同等级按时间排序（新→旧）
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

const TimelineContainer: React.FC<TimelineContainerProps> = ({
  forks,
  mine,
  forkAnalyses,
  mineAnalyses,
  selectedForkIds,
  selectedMineIds,
  onToggleFork,
  onToggleMine
}) => {
  const sortedForks = useMemo(() => sortRepos(forks, forkAnalyses), [forks, forkAnalyses]);
  const sortedMine = useMemo(() => sortRepos(mine, mineAnalyses), [mine, mineAnalyses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
      <ForksTimeline
        repos={sortedForks}
        analyses={forkAnalyses}
        selectedIds={selectedForkIds}
        onToggle={onToggleFork}
        title="Forks 仓库"
      />
      <MineTimeline
        repos={sortedMine}
        analyses={mineAnalyses}
        selectedIds={selectedMineIds}
        onToggle={onToggleMine}
        title="Mine 仓库"
      />
    </div>
  );
};

export default TimelineContainer;
