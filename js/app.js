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
import { ShortcutsPanel } from './ui/shortcuts-panel.js';
import { GraphRenderer } from './render/graph-view.js';
import { TimelineRenderer } from './render/timeline-view.js';

// 全局变量
let noteDetailRenderer = null;
let searchPanel = null;
let shortcutsPanel = null;
let graphRenderer = null;
let timelineRenderer = null;
let renderToken = 0; // 路由渲染token，防止旧请求覆盖新页面

function openSearchFromShortcut() {
    if (!searchPanel) return;
    searchPanel.open();
}

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

        // 初始化快捷键面板
        shortcutsPanel = new ShortcutsPanel();

        document.addEventListener('keydown', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
            if (e.repeat) return;

            const key = e.key.toLowerCase();
            if (key === '/') {
                e.preventDefault();
                openSearchFromShortcut();
            }
            if (key === 'n') {
                e.preventDefault();
                window.location.hash = '#/notes';
            }
            if (key === 'g') {
                e.preventDefault();
                window.location.hash = '#/graph';
            }
            if (key === 't') {
                e.preventDefault();
                window.location.hash = '#/timeline';
            }
        });

        // 绑定快捷键按钮
        const shortcutsBtn = document.getElementById('shortcuts-btn');
        if (shortcutsBtn) {
            shortcutsBtn.addEventListener('click', () => {
                shortcutsPanel.toggle();
            });
        }

        console.log('Alsay Portfolio - 加载完成');

    } catch (error) {
        console.error('应用初始化失败:', error);
    }
}

// 初始化路由
function initRoutes() {
    // 首页路由
    router.addRoute('/', showHome);

    // 笔记列表路由
    router.addRoute('/notes', showNotesList);

    // 笔记详情路由
    router.addRoute('/note/:id', (route, params) => {
        const noteId = params?.id || route.split('/')[2];
        if (noteId) {
            showNoteDetail(noteId);
        } else {
            showHome();
        }
    });

    // 知识图谱路由
    router.addRoute('/graph', showGraph);

    // 时间线路由
    router.addRoute('/timeline', showTimeline);

    // 搜索路由
    router.addRoute('/search', () => {
        if (searchPanel) searchPanel.open();
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
                    <button class="toolbar-btn" onclick="window.location.hash='#/search'" title="搜索 (/)">
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
                    双向链接知识库，聚焦检索与关联。
                </p>

                <div class="main-entries">
                    <div class="entry-grid">
                        <a href="#/notes" class="main-entry">
                            <div class="entry-icon">📝</div>
                            <div class="entry-content">
                                <h3>笔记库</h3>
                                <p>浏览全部笔记</p>
                            </div>
                        </a>
                        <a href="#/search" class="main-entry">
                            <div class="entry-icon">🔍</div>
                            <div class="entry-content">
                                <h3>快速搜索</h3>
                                <p>按 / 立即搜索</p>
                            </div>
                        </a>
                    </div>
                </div>

                <div class="learning-stats">
                    <span><strong>${store.getNotes().length}</strong> 笔记</span>
                    <span><strong>${store.getAllTags().length}</strong> 标签</span>
                    <span><strong>${Array.from(new Set(store.getNotes().flatMap(n => n.linksOut || []))).length}</strong> 连接</span>
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

// 显示笔记列表
function showNotesList() {
    document.title = '笔记库 - Alsay';

    const container = document.querySelector('.container');
    if (!container) return;

    const notes = store.getNotes();
    const topics = store.getAllTopics();
    const tags = store.getAllTags();

    container.innerHTML = `
        <div class="notes-page">
            <div class="notes-header">
                <h1>笔记库</h1>
                <div class="notes-stats">
                    <span>${notes.length} 篇笔记</span>
                    <span>${topics.length} 个主题</span>
                    <span>${tags.length} 个标签</span>
                </div>
            </div>

            <div class="notes-toolbar">
                <input type="search" id="notes-search" placeholder="搜索笔记..." />
                <select id="notes-topic-filter">
                    <option value="">全部主题</option>
                    ${topics.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
                <select id="notes-sort">
                    <option value="updatedAt">按更新时间</option>
                    <option value="title">按标题</option>
                    <option value="created">按创建时间</option>
                </select>
            </div>

            <div class="tags-cloud">
                <span class="tag-cloud-item active">全部</span>
                ${tags.map(tag => `<span class="tag-cloud-item" data-tag="${tag}">${tag}</span>`).join('')}
            </div>

            <div id="notes-grid" class="notes-grid">
                ${renderNoteCards(notes)}
            </div>
        </div>
    `;

    bindNotesEvents();
}

// 渲染笔记卡片
function renderNoteCards(notes) {
    if (notes.length === 0) {
        return '<div class="notes-empty">暂无笔记</div>';
    }

    return notes.map(note => `
        <div class="note-card" data-id="${note.id}">
            <div class="note-card-header">
                <h3>${note.title}</h3>
                <span class="note-card-topic">${note.topic || '未分类'}</span>
            </div>
            <p class="note-card-excerpt">${(note.text || '').slice(0, 150)}${(note.text || '').length > 150 ? '...' : ''}</p>
            <div class="note-card-footer">
                <span class="note-card-date">${note.updatedAt || note.createdAt}</span>
                <div class="note-card-tags">
                    ${(note.tags || []).slice(0, 3).map(tag => `<span class="mini-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 绑定笔记列表事件
function bindNotesEvents() {
    const searchInput = document.getElementById('notes-search');
    const topicFilter = document.getElementById('notes-topic-filter');
    const sortSelect = document.getElementById('notes-sort');
    const tagItems = document.querySelectorAll('.tag-cloud-item');
    const notesGrid = document.getElementById('notes-grid');

    let currentTag = '';

    function filterNotes() {
        const query = searchInput?.value.toLowerCase() || '';
        const topic = topicFilter?.value || '';
        const notes = store.searchNotes(query, { topic, tags: currentTag ? [currentTag] : [], sortBy: sortSelect?.value || 'updatedAt' });
        notesGrid.innerHTML = renderNoteCards(notes);
    }

    searchInput?.addEventListener('input', filterNotes);
    topicFilter?.addEventListener('change', filterNotes);
    sortSelect?.addEventListener('change', filterNotes);

    tagItems.forEach(item => {
        item.addEventListener('click', () => {
            const wasActive = item.classList.contains('active');
            tagItems.forEach(t => t.classList.remove('active'));
            if (wasActive || !item.dataset.tag) {
                currentTag = '';
            } else {
                item.classList.add('active');
                currentTag = item.dataset.tag;
            }
            filterNotes();
        });
    });

    // 笔记卡片点击事件（使用事件委托，避免重绘后失效）
    notesGrid?.addEventListener('click', (event) => {
        const card = event.target.closest('.note-card');
        if (!card || !notesGrid.contains(card)) return;
        const noteId = card.dataset.id;
        if (noteId) {
            window.location.hash = `/note/${noteId}`;
        }
    });
}

// 显示知识图谱
async function showGraph() {
    document.title = '知识图谱 - Alsay';

    const container = document.querySelector('.container') || document.body;

    // 清理之前的渲染器
    if (graphRenderer) {
        graphRenderer.destroy();
        graphRenderer = null;
    }

    // 创建新的渲染器
    graphRenderer = new GraphRenderer(container);
    await graphRenderer.render();
}

// 显示时间线
async function showTimeline() {
    document.title = '时间线 - Alsay';

    const container = document.querySelector('.container') || document.body;

    // 清理之前的渲染器
    if (timelineRenderer) {
        timelineRenderer = null;
    }

    // 创建新的渲染器
    timelineRenderer = new TimelineRenderer(container);
    await timelineRenderer.render();
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
