// js/render/timeline-view.js - 时间线视图
import { getNotesByTime } from '../data.js';
import { escapeHtml } from '../utils.js';

export class TimelineRenderer {
    constructor(container) {
        this.container = container;
        this.notes = [];
        this.groupedNotes = {};
    }

    async render() {
        this.container.innerHTML = `
            <div class="timeline-container">
                <div class="timeline-header">
                    <h2>学习时间线</h2>
                    <div class="timeline-controls">
                        <select id="timeline-group-by">
                            <option value="month">按月份</option>
                            <option value="year">按年份</option>
                            <option value="topic">按主题</option>
                        </select>
                        <input type="text" id="timeline-filter" placeholder="筛选笔记...">
                    </div>
                </div>
                <div id="timeline-content" class="timeline-content">
                    <div class="timeline-loading">加载中...</div>
                </div>
            </div>
        `;

        await this.loadData();
        this.renderTimeline();
        this.bindEvents();
    }

    async loadData() {
        try {
            this.notes = await getNotesByTime();
        } catch (error) {
            console.error('加载时间线数据失败:', error);
            this.notes = [];
        }
    }

    groupNotesBy(notes, groupBy) {
        const groups = {};

        notes.forEach(note => {
            let key;
            const date = new Date(note.updatedAt || note.createdAt);

            switch (groupBy) {
                case 'year':
                    key = date.getFullYear().toString() + '年';
                    break;
                case 'topic':
                    key = note.topic || '未分类';
                    break;
                case 'month':
                default:
                    key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
                    break;
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(note);
        });

        return groups;
    }

    renderTimeline() {
        const groupBy = document.getElementById('timeline-group-by')?.value || 'month';
        const filter = document.getElementById('timeline-filter')?.value.toLowerCase() || '';

        // 过滤笔记
        const filteredNotes = filter
            ? this.notes.filter(note =>
                note.title.toLowerCase().includes(filter) ||
                (note.topic && note.topic.toLowerCase().includes(filter)) ||
                (note.tags && note.tags.some(t => t.toLowerCase().includes(filter)))
            )
            : this.notes;

        // 分组
        this.groupedNotes = this.groupNotesBy(filteredNotes, groupBy);

        const content = document.getElementById('timeline-content');
        const groupKeys = Object.keys(this.groupedNotes).sort();

        if (groupKeys.length === 0) {
            content.innerHTML = `
                <div class="timeline-empty">
                    <div class="empty-icon">📭</div>
                    <p>没有找到笔记</p>
                </div>
            `;
            return;
        }

        // 按时间倒序排列
        const sortedGroups = groupBy === 'topic' ? groupKeys : groupKeys.reverse();

        content.innerHTML = `
            <div class="timeline">
                ${sortedGroups.map((groupKey, index) => {
                    const groupNotes = this.groupedNotes[groupKey];
                    const totalCount = groupNotes.length;
                    const topics = new Set(groupNotes.map(n => n.topic)).size;
                    const tags = new Set(groupNotes.flatMap(n => n.tags || [])).size;

                    return `
                        <div class="timeline-group">
                            <div class="timeline-group-header">
                                <div class="timeline-marker"></div>
                                <div class="timeline-group-info">
                                    <h3 class="timeline-group-title">${escapeHtml(groupKey)}</h3>
                                    <div class="timeline-group-stats">
                                        <span class="stat-badge">
                                            <span class="stat-icon">📝</span>
                                            ${totalCount}
                                        </span>
                                        <span class="stat-badge">
                                            <span class="stat-icon">📁</span>
                                            ${topics}
                                        </span>
                                        <span class="stat-badge">
                                            <span class="stat-icon">🏷️</span>
                                            ${tags}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-items">
                                ${groupNotes.map((note, noteIndex) => {
                                    const isFirst = index === 0 && noteIndex === 0;
                                    const isLast = index === sortedGroups.length - 1 && noteIndex === groupNotes.length - 1;
                                    const lineClass = isFirst ? 'line-start' : isLast ? 'line-end' : 'line-continue';

                                    return `
                                        <div class="timeline-item ${lineClass}">
                                            <div class="timeline-item-dot"></div>
                                            <div class="timeline-item-content">
                                                <a href="#/note/${note.id}" class="timeline-note-link">
                                                    <h4 class="timeline-note-title">${escapeHtml(note.title)}</h4>
                                                </a>
                                                <div class="timeline-note-meta">
                                                    <span class="timeline-topic">${escapeHtml(note.topic || '未分类')}</span>
                                                    <span class="timeline-date">${this.formatDate(note.updatedAt)}</span>
                                                </div>
                                                ${note.tags && note.tags.length > 0 ? `
                                                    <div class="timeline-tags">
                                                        ${note.tags.slice(0, 3).map(tag => `
                                                            <span class="timeline-tag">${escapeHtml(tag)}</span>
                                                        `).join('')}
                                                        ${note.tags.length > 3 ? `<span class="timeline-tag-more">+${note.tags.length - 3}</span>` : ''}
                                                    </div>
                                                ` : ''}
                                                ${note.text ? `
                                                    <p class="timeline-note-preview">${this.truncateText(note.text, 120)}</p>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // 今天
        if (diff < 86400000 && date.getDate() === now.getDate()) {
            return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
        }

        // 昨天
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.getDate() === yesterday.getDate()) {
            return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
        }

        // 本周
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (date > weekAgo) {
            const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            return `${days[date.getDay()]}`;
        }

        // 其他
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        const cleanText = text.replace(/\s+/g, ' ').trim();
        return cleanText.length > maxLength ? cleanText.slice(0, maxLength) + '...' : cleanText;
    }

    bindEvents() {
        const groupBySelect = document.getElementById('timeline-group-by');
        const filterInput = document.getElementById('timeline-filter');

        if (groupBySelect) {
            groupBySelect.addEventListener('change', () => this.renderTimeline());
        }

        if (filterInput) {
            filterInput.addEventListener('input', this.debounce(() => this.renderTimeline(), 300));
        }

        // 添加动画
        setTimeout(() => this.animateItems(), 100);
    }

    animateItems() {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 30);
        });
    }

    debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }
}
