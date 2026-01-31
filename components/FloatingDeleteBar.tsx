import React from 'react';

type RepoType = 'forks' | 'mine';

interface FloatingDeleteBarProps {
  selectedCount: number;
  activeTab: RepoType;
  onDelete: () => void;
}

const FloatingDeleteBar: React.FC<FloatingDeleteBarProps> = ({
  selectedCount,
  activeTab,
  onDelete
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40 animate-slide-up">
      <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-white/10 backdrop-blur-md">
        <div className="flex-1">
          <p className="text-white text-sm font-bold">已选择 {selectedCount} 个仓库</p>
          <p className="text-gray-400 text-[10px] font-medium">
            {activeTab === 'mine' ? '删除自己的仓库需要输入仓库名确认' : '确认无误后点击右侧按钮批量清理'}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          批量删除
        </button>
      </div>
    </div>
  );
};

export default FloatingDeleteBar;
