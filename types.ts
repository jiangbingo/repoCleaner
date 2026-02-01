
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  fork: boolean;
  html_url: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface AIAnalysis {
  repoId: number;
  recommendation: 'KEEP' | 'DELETE' | 'MAYBE';
  reason: string;
  // 价值评估维度
  valueScore?: number; // 0-100 价值评分
  valueDimensions?: {
    // Forks 分析维度
    learningValue?: number; // 学习价值 0-100
    referenceValue?: number; // 参考价值 0-100
    practicalValue?: number; // 实用价值 0-100
    // Mine 分析维度
    originality?: number; // 原创性 0-100
    potential?: number; // 潜力 0-100
    sentimental?: number; // 情感价值 0-100
    recoverability?: number; // 可恢复性 0-100
  };
  techStack?: string[]; // 技术栈标签
  tags?: string[]; // 特性标签
  upstreamStatus?: 'active' | 'inactive' | 'unknown'; // 上游仓库状态
  // 兼容旧字段
  learning?: number;
  reference?: number;
  utility?: number;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  DELETING = 'DELETING'
}
