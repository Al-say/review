# Alsay的个人网站

一个现代化的个人作品集网站，采用PWA架构，支持离线访问，具有出色的性能和用户体验。

## 特点

- 🚀 PWA支持，可安装为本地应用
- 🔄 离线访问能力
- 📱 响应式设计
- 🌓 自动切换暗色/亮色模式
- 🎯 SEO优化
- ⚡ 高性能加载
- 📊 实时性能监控
- 👓 无障碍访问支持

## 技术栈

- HTML5
- CSS3 (使用Container Queries, CSS Grid等现代特性)
- JavaScript (原生ES6+)
- Service Worker用于PWA支持
- Web Vitals性能监控

## 性能优化

- 资源预加载策略
- 图片延迟加载
- 字体加载优化
- 内容可见性优化
- 响应式图片
- 缓存策略

## 本地开发

1. 克隆仓库：
```bash
git clone https://github.com/Al-say/review.git
cd review
```

2. 使用本地服务器运行（例如使用Python）：
```bash
python -m http.server 8000
```

3. 访问 `http://localhost:8000`

## PWA安装

1. 使用支持PWA的浏览器访问网站
2. 点击地址栏中的安装按钮
3. 按照提示完成安装

## 目录结构

```
/
├── index.html          # 主页面
├── css/               # 样式文件
│   └── styles.css
├── js/                # JavaScript文件
│   └── script.js
├── images/           # 图片资源
├── manifest.json     # PWA配置
├── sw.js            # Service Worker
├── offline.html     # 离线页面
├── robots.txt       # 搜索引擎配置
└── sitemap.xml      # 网站地图
```

## 性能指标

- Lighthouse性能得分：95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Cumulative Layout Shift: < 0.1

## SEO优化

- 结构化数据支持
- 优化的meta标签
- robots.txt配置
- sitemap.xml支持
- 优化的URL结构

## 贡献指南

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 邮箱：me@alsay.net
- GitHub：[@Al-say](https://github.com/Al-say)

## 致谢

感谢所有为这个项目提供帮助和建议的贡献者。
