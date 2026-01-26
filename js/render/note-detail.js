// js/render/note-detail.js - 笔记详情页渲染模块
import { loadNoteContent } from '../data.js';
import { getBacklinks } from '../store.js';

export class NoteDetailRenderer {
    constructor(container) {
        this.container = container;
        this.currentNoteId = null;
    }

    // 渲染笔记详情页
    async render(noteId) {
        this.currentNoteId = noteId;

        try {
            // 加载笔记内容
            const note = await loadNoteContent(noteId);
            if (!note) {
                this.renderNotFound(noteId);
                return;
            }

            // 获取反向链接
            const backlinks = getBacklinks(noteId);

            // 渲染页面
            this.container.innerHTML = this.generateHTML(note, backlinks);

            // 绑定事件
            this.bindEvents();

        } catch (error) {
            console.error('渲染笔记详情失败:', error);
            this.renderError(error);
        }
    }

    // 生成 HTML
    generateHTML(note, backlinks) {
        return `
            <div class="note-detail">
                <header class="note-header">
                    <button class="back-btn" onclick="window.location.hash='/'">← 返回</button>
                    <h1 class="note-title">${note.title}</h1>
                    <div class="note-meta">
                        <span class="note-topic">${note.topic}</span>
                        <span class="note-date">${note.updatedAt}</span>
                    </div>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </header>

                <div class="note-content">
                    ${this.renderMarkdown(note.content)}
                </div>

                ${backlinks.length > 0 ? this.renderBacklinks(backlinks) : ''}

                <div class="note-links-out">
                    ${note.linksOut && note.linksOut.length > 0 ?
                        `<h3>相关笔记</h3>
                        <ul>
                            ${note.linksOut.map(linkId => `<li><a href="#/note/${linkId}">${linkId}</a></li>`).join('')}
                        </ul>` : ''
                    }
                </div>
            </div>
        `;
    }

    // 渲染 Markdown（简化版）
    renderMarkdown(content) {
        // 简单的 Markdown 渲染
        return content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>')
            .replace(/^\s*<p>/, '<p>')
            .replace(/<\/p>\s*$/, '</p>');
    }

    // 渲染反向链接
    renderBacklinks(backlinks) {
        return `
            <div class="backlinks-section">
                <h3>被以下笔记引用</h3>
                <ul class="backlinks-list">
                    ${backlinks.map(link => `
                        <li>
                            <a href="#/note/${link.id}" class="backlink-item">
                                <span class="backlink-title">${link.title}</span>
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
    }
}