// app.js - 主入口文件

// 全局错误捕获 - 让崩溃变成可定位的错误
window.addEventListener("error", (e) => {
  console.error("[window.error]", e.message, e.filename, e.lineno, e.colno, e.error);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("[unhandledrejection]", e.reason);
});

// 统一BASE_URL - 解决GitHub Pages路径问题
export const BASE_URL = (() => {
  const p = location.pathname;
  return p.endsWith("/") ? p : p.slice(0, p.lastIndexOf("/") + 1);
})();

// DOM 选择断言函数 - 现在从utils.js导入
// function mustGet(id) {
//   const el = document.getElementById(id);
//   if (!el) throw new Error(`Missing DOM element: #${id}`);
//   return el;
// }

// function mustQuery(selector) {
//   const el = document.querySelector(selector);
//   if (!el) throw new Error(`Missing DOM element: ${selector}`);
//   return el;
// }

import { initTypingEffect } from './typing.js';
import { initSmoothScroll, mustGet, optionalGet, optionalQuery } from './utils.js';
import { router } from './router.js';
import { store } from './store.js';
import { NoteDetailRenderer } from './render/note-detail.js';
import { SearchPanel } from './ui/search-panel.js';

// 全局变量
let noteDetailRenderer = null;
let searchPanel = null;
let renderToken = 0; // 路由渲染token，防止旧请求覆盖新页面

// 页面初始化
async function initApp() {
    console.log('Alsay Portfolio - 初始化中...');

    try {
        // 初始化数据存储
        await store.init();

        // 初始化打字机效果
        initTypingEffect();

        // 初始化平滑滚动
        initSmoothScroll();

        // 初始化路由
        initRoutes();

        // 初始化笔记详情渲染器
        const container = document.querySelector('.container') || document.body;
        noteDetailRenderer = new NoteDetailRenderer(container);

        // 初始化搜索面板
        searchPanel = new SearchPanel(store, router);

        console.log('Alsay Portfolio - 加载完成');

    } catch (error) {
        console.error('应用初始化失败:', error);
    }
}

// 初始化路由
function initRoutes() {
    // 首页路由
    router.addRoute('/', showHome);

    // 笔记详情路由
    router.addRoute('/note/:id', (route) => {
        const noteId = route.split('/')[2]; // 提取笔记 ID
        showNoteDetail(noteId);
    });

    // 默认路由
    router.addRoute('*', showHome);
}

// 显示首页
function showHome() {
    document.title = 'Alsay - 学习笔记可视化 | 个人主页';

    // 重新设计的首页内容 - 以学习笔记为中心
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <!-- 顶部工具栏 - 移动端固定 -->
            <div class="top-toolbar">
                <div class="toolbar-buttons">
                    <button class="toolbar-btn" onclick="document.dispatchEvent(new KeyboardEvent('keydown', {key: '/'}))" title="搜索 (/)">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                        <span>搜索</span>
                    </button>
                    <a class="toolbar-btn" href="notes.html" title="笔记管理" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 5c0-1.1.9-2 2-2h9l5 5v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5zm11 0v4h4"/>
                            <path d="M7 11h10v2H7zm0 4h6v2H7z"/>
                        </svg>
                        <span>管理</span>
                    </a>
                    <button class="toolbar-btn" onclick="window.location.hash='#/notes'" title="笔记库">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                        </svg>
                        <span>笔记</span>
                    </button>
                    <button class="toolbar-btn" onclick="window.location.hash='#/graph'" title="知识图谱 (g)">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>图谱</span>
                    </button>
                    <button class="toolbar-btn" onclick="window.location.hash='#/timeline'" title="时间线 (t)">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 12 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                            <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        <span>时间线</span>
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="avatar">📚</div>
                <h1>学习笔记可视化</h1>
                <p class="tagline">构建 · 连接 · 发现</p>
                <p class="description">
                    基于双向链接的个人知识库，<br>
                    支持全文搜索、知识图谱和时间线浏览。
                </p>

                <!-- 主要入口区域 -->
                <div class="main-entries">
                    <div class="entry-grid">
                        <a href="#/notes" class="main-entry">
                            <div class="entry-icon">📝</div>
                            <div class="entry-content">
                                <h3>笔记库</h3>
                                <p>浏览所有学习笔记</p>
                            </div>
                        </a>
                        <a href="#/search" class="main-entry" onclick="document.dispatchEvent(new KeyboardEvent('keydown', {key: '/'}))">
                            <div class="entry-icon">🔍</div>
                            <div class="entry-content">
                                <h3>智能搜索</h3>
                                <p>按 / 键快速搜索</p>
                            </div>
                        </a>
                        <a href="#/graph" class="main-entry">
                            <div class="entry-icon">🕸️</div>
                            <div class="entry-content">
                                <h3>知识图谱</h3>
                                <p>可视化知识连接</p>
                            </div>
                        </a>
                        <a href="#/timeline" class="main-entry">
                            <div class="entry-icon">⏰</div>
                            <div class="entry-content">
                                <h3>时间线</h3>
                                <p>按时间浏览笔记</p>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- 学习系统状态 -->
                <div class="learning-stats">
                    <div class="stat-item">
                        <div class="stat-number">${store.getNotes().length}</div>
                        <div class="stat-label">笔记</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${store.getAllTopics().length}</div>
                        <div class="stat-label">主题</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${store.getAllTags().length}</div>
                        <div class="stat-label">标签</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${Array.from(new Set(store.getNotes().flatMap(n => n.linksOut || []))).length}</div>
                        <div class="stat-label">连接</div>
                    </div>
                </div>

                <!-- 技能标签云 -->
                <div class="skills">
                    <div class="skills-title">技术栈 · Tech Stack</div>
                    <div class="skill-tags">
                        <span class="skill-tag highlight">JavaScript</span>
                        <span class="skill-tag highlight">React</span>
                        <span class="skill-tag highlight">Node.js</span>
                        <span class="skill-tag">Python</span>
                        <span class="skill-tag">Docker</span>
                        <span class="skill-tag">TypeScript</span>
                        <span class="skill-tag">Vue.js</span>
                        <span class="skill-tag">MongoDB</span>
                        <span class="skill-tag">Git</span>
                        <span class="skill-tag">AWS</span>
                    </div>
                </div>

                <!-- 作品与代码仓库 -->
                <div class="projects">
                    <div class="projects-title">作品 · Works</div>
                    <div class="project-cards">
                        <a href="https://github.com/Al-say" class="project-card" target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            GitHub 仓库
                        </a>
                        <a href="https://mzjh.top" class="project-card">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                            </svg>
                            知识库系统
                        </a>
                    </div>
                </div>

                <!-- 社交链接 -->
                <div class="social-links">
                    <a href="https://github.com/Al-say" class="social-link" target="_blank" rel="noopener">
                        <i class="fab fa-github"></i>
                    </a>
                    <a href="https://twitter.com/alsay_dev" class="social-link" target="_blank" rel="noopener">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="mailto:contact@alsay.net" class="social-link">
                        <i class="fas fa-envelope"></i>
                    </a>
                </div>

                <div class="status">
                    <span class="status-dot"></span>
                    系统状态：正常运行
                </div>
            </div>
        `;
    }
}

// 显示笔记详情
async function showNoteDetail(noteId) {
    if (!noteDetailRenderer) return;

    const token = ++renderToken;

    try {
        await noteDetailRenderer.render(noteId);
        // 只有当前token匹配时才更新标题，防止旧请求覆盖新页面
        if (token === renderToken) {
            document.title = `笔记: ${noteId} - Alsay`;
        }
    } catch (error) {
        console.error(`渲染笔记详情失败 ${noteId}:`, error);
        // 如果是当前token的请求失败了，重置标题
        if (token === renderToken) {
            document.title = 'Alsay - 全栈开发工程师 | 个人主页';
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
