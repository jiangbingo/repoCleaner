import React, { useState, useEffect } from 'react';
import { GitHubRepo } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  repos: GitHubRepo[];
  onConfirm: () => void;
  onCancel: () => void;
  isMine: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  repos,
  onConfirm,
  onCancel,
  isMine
}) => {
  const [inputValue, setInputValue] = useState('');
  const [canConfirm, setCanConfirm] = useState(false);

  const firstRepoName = isMine && repos.length > 0 ? repos[0].name : '';
  const needsInput = isMine;

  useEffect(() => {
    if (needsInput) {
      setCanConfirm(inputValue === firstRepoName);
    } else {
      setCanConfirm(true);
    }
  }, [inputValue, firstRepoName, needsInput]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (canConfirm) {
      setInputValue('');
      onConfirm();
    }
  };

  const handleCancel = () => {
    setInputValue('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {isMine ? '删除自己的仓库' : '删除 Fork 仓库'}
          </h2>
        </div>

        {isMine && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm font-semibold text-orange-800 mb-1">⚠️ 警告</p>
            <p className="text-xs text-orange-700">您即将删除自己创建的原创项目，此操作无法恢复！</p>
          </div>
        )}

        <p className="text-sm text-gray-700 mb-4">
          确认永久删除这 <span className="font-bold text-red-600">{repos.length}</span> 个项目吗？
        </p>

        <div className="max-h-48 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          {repos.slice(0, 5).map((repo, i) => (
            <div key={repo.id} className="text-xs text-gray-600 truncate">
              {repo.name}
            </div>
          ))}
          {repos.length > 5 && (
            <div className="text-xs text-gray-400 mt-1">
              …等 {repos.length} 个项目
            </div>
          )}
        </div>

        {needsInput && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              输入 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">{firstRepoName}</code> 确认删除
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入仓库名称"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              canConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-300 text-white cursor-not-allowed'
            }`}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
