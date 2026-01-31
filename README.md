# RepoCleaner - AI 驱动的 GitHub 仓库清理工具

智能分析您的 Fork 仓库和原创项目，帮助您保持 GitHub 仓库整洁。

## 功能特性

- 🤖 **AI 智能分析**：使用 GLM-4.7 深入分析每个仓库的价值
- 📊 **多维度评分**：学习价值、参考价值、实用价值三维评估
- 🔍 **分类管理**：分别管理 Fork 仓库和自己创建的项目
- 🎯 **差异化策略**：Fork 宽松删除 / 原创谨慎保留
- ✅ **安全确认**：删除自己的项目需要输入仓库名二次确认

## 运行项目

**前提条件：** Node.js

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置 API Key：
   复制 `.env.local.example` 为 `.env.local`，设置您的 GLM API Key
   ```bash
   cp .env.local.example .env.local
   ```

   在 `.env.local` 中设置：
   ```
   GLM_API_KEY=your_api_key_here
   ```

   获取 API Key：https://open.bigmodel.cn/

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 构建生产版本：
   ```bash
   npm run build
   ```

## 使用说明

1. 点击 **连接 GitHub**，输入您的 GitHub Personal Access Token
2. Token 需要 `repo` 和 `delete_repo` 权限
3. 切换 **Forks** 或 **Mine** 标签页查看不同类型的仓库
4. 点击 **AI 智能识别** 分析仓库价值
5. 根据分析结果选择要删除的仓库
6. 点击 **批量删除** 清理选中项目

## 安全说明

- Fork 仓库：简单确认即可删除（可以重新 fork）
- 自己创建的仓库：需要输入仓库名称确认（防误删）
- Token 仅存储在浏览器内存中，刷新页面即销毁

## 技术栈

- React 19.2
- TypeScript 5.8
- Vite 6.2
- Tailwind CSS
- GLM-4.7 API

## License

MIT
