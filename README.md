# 个人作品集网站

这是一个使用现代前端技术构建的静态个人作品集网站，托管在 GitHub Pages 上。

## 静态组件

本站集成了多个实用的静态组件，无需后端服务器即可运行：

### 1. 天气预报
使用 [WeatherWidget.io](https://weatherwidget.io) 提供的天气组件，特点：
- 自动更新的天气数据
- 响应式设计
- 深色主题适配
- 动画效果

### 2. 访问统计
使用 [不蒜子](https://busuanzi.ibruce.info/) 提供的访问统计功能：
- 总访问量统计
- 访客数统计
- 无需配置即可使用

### 3. 评论系统
使用 [Gitalk](https://github.com/gitalk/gitalk) 评论系统，基于 GitHub Issues：

配置方法：
1. 在 GitHub 创建 OAuth App：
   - 访问 Settings -> Developer settings -> OAuth Apps
   - 创建新应用并获取 Client ID 和 Secret
2. 更新 index.html 中的 Gitalk 配置：
   ```javascript
   const gitalk = new Gitalk({
       clientID: 'YOUR_CLIENT_ID',
       clientSecret: 'YOUR_CLIENT_SECRET',
       repo: 'review',      // 仓库名
       owner: 'Al-say',     // GitHub 用户名
       admin: ['Al-say']    // 管理员用户名
   });
   ```

## 特点

- 完全静态，无需后端服务器
- 响应式设计，适配各种设备
- 深色模式支持
- 优化的性能和加载速度
- 无障碍设计
- SEO 友好

## 技术栈

- HTML5
- CSS3 (使用现代特性如Grid, Flexbox, CSS变量)
- 原生JavaScript (ES6+)
- Font Awesome 图标
- 响应式设计

## 功能

- 深色模式切换
- 平滑滚动
- 响应式导航菜单
- 项目展示卡片
- 动画效果
- 回到顶部按钮

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 部署

网站部署在 GitHub Pages 上，访问地址：https://alsay.net
