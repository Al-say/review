// app.js - 主入口文件
import { initTypingEffect } from './typing.js';
import { initSmoothScroll } from './utils.js';
import { router } from './router.js';
import { store } from './store.js';
import { NoteDetailRenderer } from './render/note-detail.js';

// 全局变量
let noteDetailRenderer = null;

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
    document.title = 'Alsay - 全栈开发工程师 | 个人主页';

    // 恢复原始首页内容
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="avatar">👋</div>
                <h1>欢迎来到 Alsay</h1>
                <p class="tagline">探索 · 创造 · 分享</p>
                <p class="description">
                    全栈开发工程师，热爱技术与创新。<br>
                    专注于构建优雅的 Web 应用。
                </p>

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
                    目前状态：开放合作
                </div>

                <div class="projects">
                    <div class="projects-title">精选项目</div>
                    <div class="project-cards">
                        <a href="https://github.com/Al-say/portfolio" class="project-card" target="_blank" rel="noopener">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                            Portfolio
                        </a>
                        <a href="https://github.com/Al-say/blog" class="project-card" target="_blank" rel="noopener">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M0 2.5A2.5 2.5 0 012.5 0h11A2.5 2.5 0 0116 2.5v7a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 010 9.5v-7zM2.5 1A1.5 1.5 0 001 2.5v7A1.5 1.5 0 002.5 11h11A1.5 1.5 0 0015 9.5v-7A1.5 1.5 0 0013.5 1h-11z"/>
                                <path d="M10.258 6.83c.26-.26.26-.68 0-.94-.26-.26-.68-.26-.94 0l-2.5 2.5a.654.654 0 01-.94 0l-.94-.94a.654.654 0 010-.94c.26-.26.68-.26.94 0l.44.44 2.06-2.06c.26-.26.68-.26.94 0z"/>
                            </svg>
                            Blog
                        </a>
                        <a href="#/notes" class="project-card">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M0 1.75A.75.75 0 01.75 1h4.496c.331 0 .683.107.966.307l.377.25c.269.179.613.288.966.288h4.496a.75.75 0 01.75.75v8.5a.75.75 0 01-.75.75H.75a.75.75 0 01-.75-.75v-8.5zM1.5 3v7h13V3H1.5z"/>
                                <path d="M9 5.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 019 5.5zM9 8a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 019 8zm-2.25-3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM8.75 5.5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z"/>
                            </svg>
                            笔记库
                        </a>
                    </div>
                </div>

                <div class="stats">
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
                </div>

                <div class="skills">
                    <div class="skills-title">技术栈</div>
                    <div class="skill-tags">
                        <span class="skill-tag highlight">JavaScript</span>
                        <span class="skill-tag highlight">React</span>
                        <span class="skill-tag highlight">Node.js</span>
                        <span class="skill-tag">Python</span>
                        <span class="skill-tag">Docker</span>
                        <span class="skill-tag">TypeScript</span>
                        <span class="skill-tag">Vue.js</span>
                        <span class="skill-tag">MongoDB</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// 显示笔记详情
async function showNoteDetail(noteId) {
    if (noteDetailRenderer) {
        await noteDetailRenderer.render(noteId);
        document.title = `笔记: ${noteId} - Alsay`;
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);