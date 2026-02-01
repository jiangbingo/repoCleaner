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

  async analyzeRepos(repos: GitHubRepo[], repoType: 'forks' | 'mine' = 'forks'): Promise<AIAnalysis[]> {
    if (repos.length === 0) {
      return [];
    }

    const repoListSummary = repos.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || "无描述",
      lastUpdate: r.updated_at,
      stars: r.stargazers_count,
      language: this.detectLanguage(r.name, r.description),
    }));

    const prompt = repoType === 'forks'
      ? this.buildForksPrompt(repoListSummary)
      : this.buildMinePrompt(repoListSummary);

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

  private buildForksPrompt(repos: any[]): string {
    return `你是一个资深软件开发工程师和 GitHub 仓库管理专家。请深入分析以下 fork 仓库的价值，给出删除建议。

## 分析维度

### 1. 学习价值 (learning)
- 代码质量：架构设计、代码规范、最佳实践
- 技术深度：是否使用了值得学习的技术/模式
- 文档完整性：README、注释、示例

### 2. 参考价值 (reference)
- 问题解决：是否解决了特定技术难题
- 独特实现：是否有创新的解决方案
- 设计模式：是否展示了良好的设计模式应用

### 3. 实用价值 (utility)
- 直接可用：是否能直接用于生产环境
- 技术栈：使用的技术是否现代且主流
- 维护状态：最近是否有更新和社区活跃度

### 4. 技术栈评估
- 识别项目使用的主要技术和框架
- 评估技术栈是否过时（如 jQuery、AngularJS、Gulp 等）
- 识别语言类型（前端/后端/移动端/全栈等）

### 5. 项目特性
- 根据仓库名和描述提取项目功能标签
- 如：ui-component、tool、library、tutorial、boilerplate 等

## 推荐标准

| 推荐 | 条件 |
|------|------|
| **KEEP** | 综合评分 >60 或任一维度 >70 |
| **DELETE** | 综合评分 <30 且无明显价值 |
| **MAYBE** | 其他情况，需要用户判断 |

## 仓库数据

${JSON.stringify(repos, null, 2)}

## 输出格式

请以 JSON 格式返回：
{
  "analyses": [
    {
      "repoId": 仓库ID,
      "recommendation": "KEEP" | "DELETE" | "MAYBE",
      "reason": "详细分析理由（中文，50字内），说明为什么保留或删除",
      "valueScore": 综合价值评分(0-100),
      "valueDimensions": {
        "learningValue": 学习价值(0-100),
        "referenceValue": 参考价值(0-100),
        "practicalValue": 实用价值(0-100)
      },
      "techStack": ["技术栈标签数组", 如 "React", "TypeScript"],
      "tags": ["项目特性标签", 如 "ui-component", "tool"],
      "upstreamStatus": "active" | "inactive" | "unknown"
    }
  ]
}

## 注意事项
- 评分要客观，不要对所有项目都给高分
- 学习工具类项目即使 star 少也可能有高学习价值
- 过时技术栈（如 AngularJS、Gulp）会降低实用价值
- 有清晰文档和示例的项目加分
- 仓库有描述比无描述更有价值
`;
  }

  private buildMinePrompt(repos: any[]): string {
    return `你是一个资深软件开发工程师和 GitHub 仓库管理专家。请深入分析以下**你自己创建的**仓库，给出删除建议。

⚠️ 重要：这是用户原创项目，删除前需要格外谨慎！

## 分析维度

### 1. 学习价值 (learning)
- 原创性：是否包含独特的解决方案或创新思路
- 技术成长：是否展示了个人技术成长轨迹
- 里程碑意义：是否是学习过程中的重要里程碑

### 2. 参考价值 (reference)
- 复用潜力：未来可能作为参考或模板复用
- 代码片段：是否包含有价值的代码片段
- 问题记录：记录了解决特定问题的方法

### 3. 实用价值 (utility)
- 情感价值：第一个项目、获得 star 的项目
- 纪念意义：有特殊纪念意义的代码
- 历史记录：个人技术栈演进的历史记录

## 推荐标准

| 推荐 | 条件 |
|------|------|
| **KEEP** | 综合评分 >50 或任一维度 >40 |
| **DELETE** | 所有维度 <20 且明显是废弃的测试/练习代码 |
| **MAYBE** | 其他情况，强烈建议用户手动判断 |

## 仓库数据

${JSON.stringify(repos, null, 2)}

## 输出格式

请以 JSON 格式返回：
{
  "analyses": [
    {
      "repoId": 仓库ID,
      "recommendation": "KEEP" | "DELETE" | "MAYBE",
      "reason": "详细分析理由（中文，50字内），说明为什么保留或删除",
      "valueScore": 综合价值评分(0-100),
      "valueDimensions": {
        "learningValue": 学习价值(0-100),
        "referenceValue": 参考价值(0-100),
        "practicalValue": 实用价值(0-100)
      },
      "techStack": ["技术栈标签数组", 如 "React", "TypeScript"],
      "tags": ["项目特性标签", 如 "ui-component", "tool"],
      "upstreamStatus": "active" | "inactive" | "unknown"
    }
  ]
}

## 注意事项
- 宁可保留，不要误删原创代码
- 即使不完善的实验项目也可能有参考价值
- 空仓库或仅一个 README 的才建议删除
`;
  }

  // 根据仓库名和描述简单推测语言/技术栈
  private detectLanguage(name: string, description: string | null): string {
    const text = `${name} ${description || ""}`.toLowerCase();

    const patterns: Record<string, RegExp[]> = {
      JavaScript: [/\bjs\b/, /\bjavascript\b/, /node/, /\bnpm\b/, /react/, /vue/, /angular/],
      TypeScript: [/\bts\b/, /\btypescript\b/, /tsx/, /ts\(/],
      Python: [/\bpy\b/, /\bpython\b/, /django/, /flask/, /pandas/],
      Go: [/\bgo\b/, /\bgolang\b/, /\.go/],
      Rust: [/\brust\b/, /rs\./],
      Java: [/\bjava\b/, /spring/, /maven/, /gradle/],
      "C++": [/cpp/, /\bc\+\+\b/],
      Ruby: [/\bruby\b/, /rails/],
      PHP: [/\bphp\b/, /laravel/, /wordpress/],
    };

    for (const [lang, regexes] of Object.entries(patterns)) {
      if (regexes.some((r) => r.test(text))) {
        return lang;
      }
    }

    return "Unknown";
  }
}
