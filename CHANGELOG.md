# 项目变更记录

## 2026-01-31 - 项目重命名与完善

### 从 `forksweeper` 到 `repoCleaner`

**变更原因**：项目功能扩展，不再仅限于 Fork 仓库清理

**变更内容**：
- 本地项目名：`forksweeper` → `repoCleaner`
- 远程仓库名：`forksweeper` → `repoCleaner`
- 界面标题：`Fork Cleaner` → `RepoCleaner`
- 添加 CHANGELOG.md 变更记录
- 添加 docs/ 目录用于项目文档

### 功能扩展

| 新功能 | 说明 |
|--------|------|
| **Mine 管理** | 新增自建仓库管理功能 |
| **差异化分析** | Fork 和 Mine 使用不同的 AI 策略 |
| **安全确认** | 删除 Mine 需要输入仓库名确认 |
| **Tab 切换** | Forks/Mine 分类展示 |

### 文件夹重命名指南

```bash
# 当前位置
/Users/jiangbin/Documents/trae_projects/forksweeper

# 重命名后
/Users/jiangbin/Documents/trae_projects/repoCleaner
```

**执行命令**：
```bash
cd /Users/jiangbin/Documents/trae_projects
mv forksweeper repoCleaner
cd repoCleaner
```

### 注意事项

- ✅ `package.json` 已更新为 `repoCleaner`
- ✅ `App.tsx` 标题已更新为 `RepoCleaner`
- ✅ 远程仓库配置保持不变（`forksweeper`）
- ⚠️ Git 远程仓库不会自动重命名（需要手动操作）
