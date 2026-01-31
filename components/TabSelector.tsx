import React from 'react';

type RepoType = 'forks' | 'mine';

interface TabSelectorProps {
  activeTab: RepoType;
  onTabChange: (tab: RepoType) => void;
  forksCount: number;
  mineCount: number;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
  forksCount,
  mineCount,
}) => {
  return (
    <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
      <button
        onClick={() => onTabChange('forks')}
        className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-bold text-sm transition-all ${
          activeTab === 'forks'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Forks
        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
          activeTab === 'forks' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {forksCount}
        </span>
      </button>

      <button
        onClick={() => onTabChange('mine')}
        className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-bold text-sm transition-all ${
          activeTab === 'mine'
            ? 'border-orange-600 text-orange-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        Mine
        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
          activeTab === 'mine' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {mineCount}
        </span>
      </button>
    </div>
  );
};

export default TabSelector;
