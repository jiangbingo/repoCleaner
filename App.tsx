
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GitHubRepo, AIAnalysis, AppState } from './types';
import { GitHubService } from './services/githubService';
import { GLMService } from './services/glmService';
import TokenInput from './components/TokenInput';
import RepoCard from './components/RepoCard';
import TabSelector from './components/TabSelector';

type RepoType = 'forks' | 'mine';

// 删除确认组件
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  repos: GitHubRepo[];
  onConfirm: () => void;
  onCancel: () => void;
  isMine: boolean;
}> = ({ isOpen, repos, onConfirm, onCancel, isMine }) => {
  const [inputValue, setInputValue] = useState('');
  const [canConfirm, setCanConfirm] = useState(false);

  // 对于 mine 类型，需要输入第一个仓库名确认
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
              ...等 {repos.length} 个项目
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

const App: React.FC = () => {
  // 从 sessionStorage 初始化 token
  const [token, setToken] = useState<string>(() => {
    return sessionStorage.getItem('github_token') || '';
  });
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [activeTab, setActiveTab] = useState<RepoType>('forks');
  const [forks, setForks] = useState<GitHubRepo[]>([]);
  const [mine, setMine] = useState<GitHubRepo[]>([]);
  const [selectedForkIds, setSelectedForkIds] = useState<Set<number>>(new Set());
  const [selectedMineIds, setSelectedMineIds] = useState<Set<number>>(new Set());
  const [forkAnalyses, setForkAnalyses] = useState<Record<number, AIAnalysis>>({});
  const [mineAnalyses, setMineAnalyses] = useState<Record<number, AIAnalysis>>({});
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 删除相关的详细状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteLog, setDeleteLog] = useState<{name: string, status: 'pending' | 'success' | 'error', error?: string}[]>([]);
  const [currentDeletingIndex, setCurrentDeletingIndex] = useState(-1);

  const gitHubService = useMemo(() => token ? new GitHubService(token) : null, [token]);
  const glmService = useMemo(() => new GLMService(), []);

  // 当前显示的仓库和分析
  const currentRepos = activeTab === 'forks' ? forks : mine;
  const currentAnalyses = activeTab === 'forks' ? forkAnalyses : mineAnalyses;
  const currentSelectedIds = activeTab === 'forks' ? selectedForkIds : selectedMineIds;

  // 统一的选中状态管理函数，避免闭包陷阱
  const updateSelectedIds = useCallback((ids: Set<number>) => {
    if (activeTab === 'forks') {
      setSelectedForkIds(ids);
    } else {
      setSelectedMineIds(ids);
    }
  }, [activeTab]);

  // 自动连接（如果有保存的 token）
  useEffect(() => {
    const savedToken = sessionStorage.getItem('github_token');
    if (savedToken && status === AppState.IDLE) {
      // 内联连接逻辑，避免依赖 handleConnect 导致的额外渲染
      setStatus(AppState.LOADING);
      setError(null);
      const service = new GitHubService(savedToken);
      Promise.all([service.getCurrentUser(), service.listAllRepos()])
        .then(([userData, allRepos]) => {
          setUser(userData);
          setForks(allRepos.forks);
          setMine(allRepos.mine);
          setToken(savedToken);
          setStatus(AppState.LOADED);
        })
        .catch((err: any) => {
          setError(err.message || "连接 GitHub 失败，请确保 Token 具有 repo 和 delete_repo 权限。");
          setStatus(AppState.IDLE);
          sessionStorage.removeItem('github_token');
        });
    }
  }, []); // 空依赖数组，仅在挂载时执行

  // 登出处理
  const handleLogout = () => {
    sessionStorage.removeItem('github_token');
    setToken('');
    setUser(null);
    setForks([]);
    setMine([]);
    setForkAnalyses({});
    setMineAnalyses({});
    setSelectedForkIds(new Set());
    setSelectedMineIds(new Set());
    setStatus(AppState.IDLE);
  };

  const handleConnect = async (inputToken: string) => {
    setStatus(AppState.LOADING);
    setError(null);
    try {
      const service = new GitHubService(inputToken);
      const userData = await service.getCurrentUser();
      const allRepos = await service.listAllRepos();

      // 保存 token 到 sessionStorage
      sessionStorage.setItem('github_token', inputToken);

      setUser(userData);
      setForks(allRepos.forks);
      setMine(allRepos.mine);
      setToken(inputToken);
      setStatus(AppState.LOADED);
    } catch (err: any) {
      setError(err.message || "连接 GitHub 失败，请确保 Token 具有 repo 和 delete_repo 权限。");
      setStatus(AppState.IDLE);
    }
  };

  const handleAnalyze = async () => {
    if (currentRepos.length === 0) return;
    setStatus(AppState.LOADING);
    setError(null);
    try {
      const results = await glmService.analyzeRepos(currentRepos, activeTab);
      const analysisMap: Record<number, AIAnalysis> = {};
      results.forEach(analysis => {
        analysisMap[analysis.repoId] = analysis;
      });

      if (activeTab === 'forks') {
        setForkAnalyses(analysisMap);
        const deleteIds = results.filter(a => a.recommendation === 'DELETE').map(a => Number(a.repoId));
        setSelectedForkIds(new Set(deleteIds));
      } else {
        setMineAnalyses(analysisMap);
        // mine 类型不自动勾选 DELETE，让用户手动确认
        setSelectedMineIds(new Set());
      }
    } catch (err) {
      setError("AI 智能分析暂时不可用，请稍后再试。");
    } finally {
      setStatus(AppState.LOADED);
    }
  };

  const toggleRepo = useCallback((id: number) => {
    if (activeTab === 'forks') {
      setSelectedForkIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelectedMineIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  }, [activeTab]);

  const handleTabChange = (tab: RepoType) => {
    setActiveTab(tab);
    // 切换标签时不清空已选择状态，但搜索词清空
    setSearchTerm('');
  };

  const handleDeleteSelected = async () => {
    if (!gitHubService || currentSelectedIds.size === 0) return;

    // 先显示确认弹窗
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);

    if (!gitHubService || currentSelectedIds.size === 0) return;

    const selectedRepos = currentRepos.filter(r => currentSelectedIds.has(Number(r.id)));
    const initialLog = selectedRepos.map(r => ({ name: r.full_name, status: 'pending' as const }));
    setDeleteLog(initialLog);
    setIsDeleting(true);
    setStatus(AppState.DELETING);

    let successCount = 0;

    for (let i = 0; i < selectedRepos.length; i++) {
      const repo = selectedRepos[i];
      setCurrentDeletingIndex(i);

      try {
        await gitHubService.deleteRepo(repo.full_name);
        setDeleteLog(prev => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'success' };
          return next;
        });
        successCount++;
      } catch (e: any) {
        setDeleteLog(prev => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'error', error: e.message };
          return next;
        });
      }
      await new Promise(r => setTimeout(r, 200));
    }

    setTimeout(async () => {
      try {
        const allRepos = await gitHubService.listAllRepos();
        setForks(allRepos.forks);
        setMine(allRepos.mine);
        updateSelectedIds(new Set());
        setIsDeleting(false);
        setStatus(AppState.LOADED);
        alert(`清理完成！成功删除 ${successCount} 个项目。`);
      } catch (e) {
        window.location.reload();
      }
    }, 1000);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const filteredRepos = useMemo(() => {
    return currentRepos.filter(r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [currentRepos, searchTerm]);

  if (status === AppState.IDLE && !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenInput onConfirm={handleConnect} isLoading={status === AppState.LOADING} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
              onClick={handleLogout}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Tab Selector */}
        <div className="mb-8">
          <TabSelector
            activeTab={activeTab}
            onTabChange={handleTabChange}
            forksCount={forks.length}
            mineCount={mine.length}
          />
        </div>

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
                  onClick={handleAnalyze}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map(repo => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isSelected={currentSelectedIds.has(repo.id)}
              onToggle={toggleRepo}
              analysis={currentAnalyses[repo.id]}
              isFork={activeTab === 'forks'}
            />
          ))}
          {filteredRepos.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className="text-gray-400 font-bold">没有找到符合条件的仓库</p>
            </div>
          )}
        </div>
      </main>

      {currentSelectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40 animate-slide-up">
          <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-white/10 backdrop-blur-md">
            <div className="flex-1">
              <p className="text-white text-sm font-bold">已选择 {currentSelectedIds.size} 个仓库</p>
              <p className="text-gray-400 text-[10px] font-medium">
                {activeTab === 'mine' ? '删除自己的仓库需要输入仓库名确认' : '确认无误后点击右侧按钮批量清理'}
              </p>
            </div>
            <button
              onClick={handleDeleteSelected}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              批量删除
            </button>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">正在清理仓库...</h2>
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {deleteLog.map((log, idx) => (
                <div key={idx} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  idx === currentDeletingIndex ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-500' : 
                  log.status === 'success' ? 'border-green-100 bg-green-50/50' :
                  log.status === 'error' ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${
                      log.status === 'pending' ? 'text-gray-400' : 'text-gray-700'
                    }`}>{log.name}</p>
                    {log.error && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{log.error}</p>}
                  </div>
                  {log.status === 'success' ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  ) : log.status === 'error' ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          repos={currentRepos.filter(r => currentSelectedIds.has(r.id))}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isMine={activeTab === 'mine'}
        />
      )}
    </div>
  );
};

// Fix for index.tsx error: Module '"file:///App"' has no default export.
export default App;
