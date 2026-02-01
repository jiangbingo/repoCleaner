
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GitHubRepo, AIAnalysis, AppState } from './types';
import { GitHubService } from './services/githubService';
import { GLMService } from './services/glmService';
import TokenInput from './components/TokenInput';
import TabSelector from './components/TabSelector';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import DeleteProgressModal from './components/DeleteProgressModal';
import AppHeader from './components/AppHeader';
import RepoControls from './components/RepoControls';
import RepoGrid from './components/RepoGrid';
import FloatingDeleteBar from './components/FloatingDeleteBar';
import TimelineContainer from './components/TimelineContainer';

type RepoType = 'forks' | 'mine';
type ViewMode = 'grid' | 'timeline';

const App: React.FC = () => {
  // 从 sessionStorage 初始化 token
  const [token, setToken] = useState<string>(() => {
    return sessionStorage.getItem('github_token') || '';
  });
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
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
    // 时间轴模式：同时分析 forks 和 mine
    if (viewMode === 'timeline') {
      if (forks.length === 0 && mine.length === 0) return;
      setStatus(AppState.LOADING);
      setError(null);
      try {
        // 并发分析 forks 和 mine
        const [forkResults, mineResults] = await Promise.all([
          forks.length > 0 ? glmService.analyzeRepos(forks, 'forks') : Promise.resolve([]),
          mine.length > 0 ? glmService.analyzeRepos(mine, 'mine') : Promise.resolve([])
        ]);

        // 更新 fork 分析结果
        const forkAnalysisMap: Record<number, AIAnalysis> = {};
        forkResults.forEach(analysis => {
          forkAnalysisMap[analysis.repoId] = analysis;
        });
        setForkAnalyses(forkAnalysisMap);
        const forkDeleteIds = forkResults.filter(a => a.recommendation === 'DELETE').map(a => Number(a.repoId));
        setSelectedForkIds(new Set(forkDeleteIds));

        // 更新 mine 分析结果
        const mineAnalysisMap: Record<number, AIAnalysis> = {};
        mineResults.forEach(analysis => {
          mineAnalysisMap[analysis.repoId] = analysis;
        });
        setMineAnalyses(mineAnalysisMap);
        setSelectedMineIds(new Set());
      } catch (err) {
        setError("AI 智能分析暂时不可用，请稍后再试。");
      } finally {
        setStatus(AppState.LOADED);
      }
    } else {
      // 网格模式：只分析当前标签
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
          setSelectedMineIds(new Set());
        }
      } catch (err) {
        setError("AI 智能分析暂时不可用，请稍后再试。");
      } finally {
        setStatus(AppState.LOADED);
      }
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
    if (!gitHubService) return;

    // 时间轴模式：检查是否有选中的仓库
    if (viewMode === 'timeline') {
      if (selectedForkIds.size === 0 && selectedMineIds.size === 0) return;
    } else {
      // 网格模式：检查当前标签的选中
      if (currentSelectedIds.size === 0) return;
    }

    // 先显示确认弹窗
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);

    if (!gitHubService) return;

    // 时间轴模式：收集所有选中的仓库
    let selectedRepos: GitHubRepo[] = [];
    if (viewMode === 'timeline') {
      selectedRepos = [
        ...forks.filter(r => selectedForkIds.has(r.id)),
        ...mine.filter(r => selectedMineIds.has(r.id))
      ];
    } else {
      // 网格模式：当前标签的选中
      if (currentSelectedIds.size === 0) return;
      selectedRepos = currentRepos.filter(r => currentSelectedIds.has(Number(r.id)));
    }

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

        // 立即从列表中移除已删除的仓库
        const isFork = forks.some(r => r.id === repo.id);
        if (isFork) {
          setForks(prev => prev.filter(r => r.id !== repo.id));
          setForkAnalyses(prev => {
            const next = { ...prev };
            delete next[repo.id];
            return next;
          });
          setSelectedForkIds(prev => {
            const next = new Set(prev);
            next.delete(repo.id);
            return next;
          });
        } else {
          setMine(prev => prev.filter(r => r.id !== repo.id));
          setMineAnalyses(prev => {
            const next = { ...prev };
            delete next[repo.id];
            return next;
          });
          setSelectedMineIds(prev => {
            const next = new Set(prev);
            next.delete(repo.id);
            return next;
          });
        }

        setDeleteLog(prev => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'success' };
          return next;
        });
        successCount++;
      } catch (e: any) {
        // 失败则保留在列表中，只记录错误
        setDeleteLog(prev => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'error', error: e.message };
          return next;
        });
      }
      await new Promise(r => setTimeout(r, 200));
    }

    // 删除完成，重置状态并显示汇总
    setIsDeleting(false);
    setStatus(AppState.LOADED);
    setDeleteLog([]);
    setCurrentDeletingIndex(-1);

    const failCount = selectedRepos.length - successCount;
    if (failCount === 0) {
      alert(`✅ 清理完成！成功删除 ${successCount} 个项目。`);
    } else {
      alert(`⚠️ 清理完成！成功 ${successCount} 个，失败 ${failCount} 个。失败的仓库保留在列表中，请稍后重试。`);
    }
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
      <AppHeader user={user} onLogout={handleLogout} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* 视图切换和工具栏 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 视图切换按钮 */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📅 时间轴
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ⊞ 网格
              </button>
            </div>

            {/* 网格模式显示标签切换 */}
            {viewMode === 'grid' && (
              <TabSelector
                activeTab={activeTab}
                onTabChange={handleTabChange}
                forksCount={forks.length}
                mineCount={mine.length}
              />
            )}
          </div>

          {/* AI 分析按钮 */}
          <button
            onClick={handleAnalyze}
            disabled={status === AppState.LOADING || (viewMode === 'grid' && currentRepos.length === 0) || (viewMode === 'timeline' && forks.length === 0 && mine.length === 0)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            {status === AppState.LOADING ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                分析中…
              </>
            ) : (
              <>
                <span>✨</span>
                AI 智能识别
              </>
            )}
          </button>
        </div>

        {/* 时间轴视图 */}
        {viewMode === 'timeline' && (
          <TimelineContainer
            forks={forks}
            mine={mine}
            forkAnalyses={forkAnalyses}
            mineAnalyses={mineAnalyses}
            selectedForkIds={selectedForkIds}
            selectedMineIds={selectedMineIds}
            onToggleFork={(id) => {
              setSelectedForkIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
            onToggleMine={(id) => {
              setSelectedMineIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
          />
        )}

        {/* 网格视图 */}
        {viewMode === 'grid' && (
          <>
            <RepoControls
              activeTab={activeTab}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              status={status}
              currentRepos={currentRepos}
              currentSelectedIds={currentSelectedIds}
              onAnalyze={handleAnalyze}
              updateSelectedIds={updateSelectedIds}
            />

            <RepoGrid
              repos={filteredRepos}
              analyses={currentAnalyses}
              selectedIds={currentSelectedIds}
              onToggle={toggleRepo}
              activeTab={activeTab}
            />
          </>
        )}
      </main>

      {/* 浮动删除按钮 */}
      {(viewMode === 'timeline' ? (selectedForkIds.size > 0 || selectedMineIds.size > 0) : currentSelectedIds.size > 0) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={handleDeleteSelected}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-2xl shadow-2xl hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>删除选中</span>
            <span className="px-2 py-1 bg-white/20 rounded-lg text-sm">
              {viewMode === 'timeline' ? selectedForkIds.size + selectedMineIds.size : currentSelectedIds.size}
            </span>
          </button>
        </div>
      )}

      {isDeleting && (
        <DeleteProgressModal
          deleteLog={deleteLog}
          currentDeletingIndex={currentDeletingIndex}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          repos={viewMode === 'timeline'
            ? [...forks.filter(r => selectedForkIds.has(r.id)), ...mine.filter(r => selectedMineIds.has(r.id))]
            : currentRepos.filter(r => currentSelectedIds.has(r.id))
          }
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isMine={viewMode === 'timeline' ? false : activeTab === 'mine'}
        />
      )}
    </div>
  );
};

// Fix for index.tsx error: Module '"file:///App"' has no default export.
export default App;
