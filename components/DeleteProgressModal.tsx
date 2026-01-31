import React from 'react';

interface DeleteLog {
  name: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

interface DeleteProgressModalProps {
  deleteLog: DeleteLog[];
  currentDeletingIndex: number;
}

const DeleteProgressModal: React.FC<DeleteProgressModalProps> = ({
  deleteLog,
  currentDeletingIndex
}) => {
  return (
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
  );
};

export default DeleteProgressModal;
