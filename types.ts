
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
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  DELETING = 'DELETING'
}
