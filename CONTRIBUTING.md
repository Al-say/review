# 贡献指南

感谢您考虑为本项目做出贡献！以下是一些指导原则。

## 问题反馈

如果您发现了 bug 或有新功能建议，请先查看 [issues](https://github.com/Al-say/review/issues) 确保没有重复。如果没有相关 issue，请创建一个新的。

创建 issue 时请包含：
- 对问题/建议的清晰描述
- 重现步骤（如果是 bug）
- 预期行为和实际行为
- 截图（如果有助于说明问题）
- 浏览器版本和操作系统信息

## 提交代码

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m '添加某个特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request

### 代码风格指南

- HTML
  - 使用语义化标签
  - 确保无障碍性 (ARIA 属性)
  - 保持缩进一致（2空格）

- CSS
  - 使用 CSS 变量进行主题配置
  - 遵循 BEM 命名约定
  - 优先使用 Flexbox 和 Grid 布局
  - 保持媒体查询的一致性

- JavaScript
  - 使用现代 ES6+ 语法
  - 避免全局变量
  - 使用有意义的变量名
  - 代码注释应该解释"为什么"而不是"是什么"

### Pull Request 指南

- 标题应简明扼要地描述变更
- 描述中应包含相关 issue 的引用
- 确保所有测试通过
- 更新相关文档
- 一个 PR 只做一件事

## 开发设置

1. 克隆仓库
```bash
git clone https://github.com/[your-username]/review.git
cd review
```

2. 运行本地服务器
```bash
python -m http.server 8000
# 或
npx serve
```

## 许可证

通过提交代码，您同意您的贡献将采用与本项目相同的 [MIT 许可证](LICENSE)。
