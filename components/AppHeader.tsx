import React from 'react';

interface AppHeaderProps {
  user: any;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">RepoCleaner</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.login}</span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
          >
            登出
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
