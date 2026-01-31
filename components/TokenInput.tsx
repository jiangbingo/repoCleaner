
import React, { useState } from 'react';

interface TokenInputProps {
  onConfirm: (token: string) => void;
  isLoading: boolean;
}

const TokenInput: React.FC<TokenInputProps> = ({ onConfirm, isLoading }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) onConfirm(token.trim());
  };

  return (
    <div className="max-w-md w-full p-10 bg-white rounded-2xl border border-gray-200 shadow-xl">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">连接 GitHub</h2>
        <p className="text-gray-500 text-center text-sm font-medium px-4">
          请输入您的 GitHub Personal Access Token (Classic) <br/>
          需包含 <span className="text-blue-600 font-bold">delete_repo</span> 权限。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Access Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all font-mono"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-200 active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : '连接账号'}
        </button>
      </form>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">隐私安全声明</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          您的 Token 仅保存在浏览器内存中，刷新页面即会销毁。我们不会以任何形式在服务器存储或收集您的任何敏感信息。
        </p>
      </div>
    </div>
  );
};

export default TokenInput;
