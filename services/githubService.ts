
import { GitHubRepo } from '../types';

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 404 && options.method === 'DELETE') {
        throw new Error('权限不足或仓库不存在。请确认 Token 包含 delete_repo 权限。');
      }
      if (response.status === 403) {
        throw new Error('API 调用受限 (Rate limited) 或权限不足。');
      }
      const error = await response.json().catch(() => ({ message: '未知错误' }));
      throw new Error(error.message || `GitHub 错误: ${response.status}`);
    }

    return response;
  }

  async getCurrentUser() {
    const res = await this.fetchWithAuth('https://api.github.com/user');
    return res.json();
  }

  async listForks(): Promise<GitHubRepo[]> {
    let page = 1;
    let allRepos: GitHubRepo[] = [];
    let hasMore = true;

    while (hasMore) {
      const res = await this.fetchWithAuth(`https://api.github.com/user/repos?type=owner&per_page=100&page=${page}`);
      const data: GitHubRepo[] = await res.json();

      if (data.length === 0) {
        hasMore = false;
      } else {
        const forks = data.filter(repo => repo.fork);
        allRepos = [...allRepos, ...forks];
        page++;
      }

      // Safety break for very large accounts (1000 repos)
      if (page > 10) break;
    }

    return allRepos;
  }

  async listAllRepos(): Promise<{ forks: GitHubRepo[], mine: GitHubRepo[] }> {
    let page = 1;
    let allRepos: GitHubRepo[] = [];
    let hasMore = true;

    while (hasMore) {
      const res = await this.fetchWithAuth(`https://api.github.com/user/repos?type=owner&per_page=100&page=${page}`);
      const data: GitHubRepo[] = await res.json();

      if (data.length === 0) {
        hasMore = false;
      } else {
        allRepos = [...allRepos, ...data];
        page++;
      }

      // Safety break for very large accounts (1000 repos)
      if (page > 10) break;
    }

    // 按是否 fork 分组
    const forks = allRepos.filter(repo => repo.fork);
    const mine = allRepos.filter(repo => !repo.fork);

    return { forks, mine };
  }

  async deleteRepo(fullName: string): Promise<void> {
    await this.fetchWithAuth(`https://api.github.com/repos/${fullName}`, {
      method: 'DELETE',
    });
  }
}
