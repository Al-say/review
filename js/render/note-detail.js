// js/render/note-detail.js - 笔记详情页渲染模块
import { loadNoteContent } from '../data.js';
import { getBacklinks } from '../store.js';
import { store } from '../store.js';
import { escapeHtml } from '../utils.js';

// 触摸滑动导航控制器
class TouchNavigation {
    constructor(onSwipeLeft, onSwipeRight) {
        this.onSwipeLeft = onSwipeLeft;
        this.onSwipeRight = onSwipeRight;
        this.startX = 0;
        this.startY = 0;
        this.minSwipeDistance = 80;
        this.maxVerticalDistance = 50;
        this.isTracking = false;
        // 保存绑定函数引用，用于清理
        this._handleTouchStart = null;
        this._handleTouchMove = null;
        this._handleTouchEnd = null;

        this.bind();
    }

    bind() {
        // 保存原始绑定函数的引用
        this._handleTouchStart = this.handleTouchStart.bind(this);
        this._handleTouchMove = this.handleTouchMove.bind(this);
        this._handleTouchEnd = this.handleTouchEnd.bind(this);

        // touchmove 需要 passive: false 才能调用 preventDefault()
        document.addEventListener('touchstart', this._handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        document.addEventListener('touchend', this._handleTouchEnd);
    }

    unbind() {
        // 使用保存的引用来移除监听器
        if (this._handleTouchStart) {
            document.removeEventListener('touchstart', this._handleTouchStart);
            this._handleTouchStart = null;
        }
        if (this._handleTouchMove) {
            document.removeEventListener('touchmove', this._handleTouchMove);
            this._handleTouchMove = null;
        }
        if (this._handleTouchEnd) {
            document.removeEventListener('touchend', this._handleTouchEnd);
            this._handleTouchEnd = null;
        }
    }

    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.isTracking = true;
    }

    handleTouchMove(e) {
        if (!this.isTracking) return;
        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (!this.isTracking) return;
        this.isTracking = false;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const diffX = endX - this.startX;
        const diffY = Math.abs(endY - this.startY);

        // 如果垂直移动过大，不触发滑动
        if (diffY > this.maxVerticalDistance) return;

        if (Math.abs(diffX) > this.minSwipeDistance) {
            if (diffX > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        }
    }
}

export class NoteDetailRenderer {
    constructor(container) {
        this.container = container;
        this.currentNoteId = null;
        this.currentRenderToken = 0;
        this.touchNavigation = null;
    }

    // 渲染笔记详情页
    async render(noteId, renderToken = null) {
        const token = renderToken || ++this.currentRenderToken;
        this.currentNoteId = noteId;

        // 显示加载状态
        this.showLoading();

        try {
            // 加载笔记内容
            const note = await loadNoteContent(noteId);

            // 检查是否还是当前渲染请求
            if (token !== this.currentRenderToken) return;

            if (!note) {
                this.renderNotFound(noteId);
                return;
            }

            // 获取反向链接
            const backlinks = getBacklinks(noteId);

            // 再次检查token
            if (token !== this.currentRenderToken) return;

            // 渲染页面
            this.container.innerHTML = this.generateHTML(note, backlinks);

            // 绑定事件
            this.bindEvents();

        } catch (error) {
            console.error('渲染笔记详情失败:', error);
            // 只有当前token的错误才显示
            if (token === this.currentRenderToken) {
                this.renderError(error);
            }
        }
    }

    // 生成 HTML
    generateHTML(note, backlinks) {
        // 获取相邻笔记
        const notes = store.getNotes();
        const currentIndex = notes.findIndex(n => n.id === note.id);
        const prevNote = currentIndex > 0 ? notes[currentIndex - 1] : null;
        const nextNote = currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;
        const safeTitle = escapeHtml(note.title || '');
        const safeTopic = escapeHtml(note.topic || '未分类');
        const safeDate = escapeHtml(note.updatedAt || note.createdAt || '');

        return `
            <div class="note-detail">
                <header class="note-header">
                    <button class="back-btn" onclick="window.location.hash='/'">← 返回</button>
                    <h1 class="note-title">${safeTitle}</h1>
                    <div class="note-meta">
                        <span class="note-topic">${safeTopic}</span>
                        <span class="note-date">${safeDate}</span>
                    </div>
                    <div class="note-tags">
                        ${(note.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                </header>

                <div class="note-content">
                    ${note.contentHtml || ''}
                </div>

                ${backlinks.length > 0 ? this.renderBacklinks(backlinks) : ''}

                <div class="note-links-out">
                    ${note.linksOut && note.linksOut.length > 0 ?
                        `<h3>相关笔记</h3>
                        <ul>
                            ${note.linksOut.map(linkId => {
                                const safeId = encodeURIComponent(String(linkId));
                                return `<li><a href="#/note/${safeId}">${escapeHtml(linkId)}</a></li>`;
                            }).join('')}
                        </ul>` : ''
                    }
                </div>

                <!-- 导航按钮 -->
                <div class="note-navigation">
                    ${prevNote ? `<a href="#/note/${encodeURIComponent(String(prevNote.id))}" class="nav-btn prev-btn" title="上一篇: ${escapeHtml(prevNote.title)}">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                        <span>${escapeHtml(prevNote.title)}</span>
                    </a>` : ''}
                    ${nextNote ? `<a href="#/note/${encodeURIComponent(String(nextNote.id))}" class="nav-btn next-btn" title="下一篇: ${escapeHtml(nextNote.title)}">
                        <span>${escapeHtml(nextNote.title)}</span>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </a>` : ''}
                </div>
            </div>
        `;
    }

    // 渲染反向链接
    renderBacklinks(backlinks) {
        return `
            <div class="backlinks-section">
                <h3>被以下笔记引用</h3>
                <ul class="backlinks-list">
                    ${backlinks.map(link => `
                        <li>
                            <a href="#/note/${encodeURIComponent(String(link.id))}" class="backlink-item">
                                <span class="backlink-title">${escapeHtml(link.title)}</span>
                                <span class="backlink-arrow">→</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // 渲染未找到页面
    renderNotFound(noteId) {
        this.container.innerHTML = `
            <div class="note-not-found">
                <h1>笔记未找到</h1>
                <p>找不到 ID 为 "${noteId}" 的笔记</p>
                <button onclick="window.location.hash='/'">返回首页</button>
            </div>
        `;
    }

    // 渲染错误页面
    renderError(error) {
        this.container.innerHTML = `
            <div class="note-error">
                <h1>加载失败</h1>
                <p>${error.message}</p>
                <button onclick="window.location.hash='/'">返回首页</button>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        // 处理内部链接
        this.container.querySelectorAll('a[href^="#/note/"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const noteId = link.getAttribute('href').replace('#/note/', '');
                window.location.hash = `/note/${noteId}`;
            });
        });

        // 初始化触摸滑动导航
        this.initTouchNavigation();
    }

    // 初始化触摸导航
    initTouchNavigation() {
        // 清理之前的触摸导航
        if (this.touchNavigation) {
            this.touchNavigation.unbind();
        }

        // 获取导航按钮
        const prevBtn = this.container.querySelector('.prev-btn');
        const nextBtn = this.container.querySelector('.next-btn');

        // 创建新的触摸导航
        this.touchNavigation = new TouchNavigation(
            () => {
                // 向左滑动，切换到下一篇
                if (nextBtn) {
                    window.location.hash = nextBtn.getAttribute('href');
                }
            },
            () => {
                // 向右滑动，切换到上一篇
                if (prevBtn) {
                    window.location.hash = prevBtn.getAttribute('href');
                }
            }
        );
    }

    // 显示加载状态
    showLoading() {
        this.container.innerHTML = `
            <div class="note-loading">
                <div class="loading-spinner"></div>
                <p>加载笔记中...</p>
            </div>
        `;
    }
}

function sanitizeUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '#';
    if (raw.startsWith('#') || raw.startsWith('/')) return raw;
    if (/^(https?:|mailto:)/i.test(raw)) return raw;
    return '#';
}
