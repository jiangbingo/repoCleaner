import { GitHubRepo, AIAnalysis } from "../types";

export class GLMService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.GLM_API_KEY || "";
    this.baseURL = "https://open.bigmodel.cn/api/paas/v4";
  }

  private async callChatCompletion(messages: any[]): Promise<any> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4.7",
        messages: messages,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GLM API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async analyzeRepos(repos: GitHubRepo[]): Promise<AIAnalysis[]> {
    if (repos.length === 0) {
      return [];
    }

    const repoListSummary = repos.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || "无描述",
      lastUpdate: r.updated_at,
      stars: r.stargazers_count,
    }));

    const prompt = `你是一个 GitHub 仓库管理助手。请分析以下 fork 仓库列表，并推荐哪些应该被删除。

分析标准：
1. 超过1年未更新的仓库
2. 没有描述的仓库
3. 星标数量为0的仓库
4. 看起来不再活跃的项目

对于每个仓库，给出以下推荐之一：
- KEEP: 保留（有价值的活跃项目）
- DELETE: 删除（明显不活跃的项目）
- MAYBE: 可能保留（需要用户判断）

仓库列表：
${JSON.stringify(repoListSummary, null, 2)}

请以 JSON 格式返回结果，格式如下：
{
  "analyses": [
    {
      "repoId": 仓库ID数字,
      "recommendation": "KEEP" 或 "DELETE" 或 "MAYBE",
      "reason": "推荐理由（中文）"
    }
  ]
}`;

    try {
      const response = await this.callChatCompletion([
        {
          role: "user",
          content: prompt,
        },
      ]);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from GLM API");
      }

      const parsed = JSON.parse(content);
      return parsed.analyses || [];
    } catch (e) {
      console.error("GLM AI analysis failed:", e);
      throw e;
    }
  }
}
