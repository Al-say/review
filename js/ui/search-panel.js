// js/ui/search-panel.js - 搜索面板UI组件
export class SearchPanel {
    constructor(store, router) {
        this.store = store;
        this.router = router;
        this.isOpen = false;
        this.currentQuery = '';
        this.selectedIndex = 0;
        this.results = [];
        this.filters = {
            topic: '',
            tags: [],
            sortBy: 'relevance' // 'relevance' | 'updatedAt'
        };

        this.init();
    }

    init() {
        this.createPanel();
        this.bindEvents();
        this.bindKeyboardShortcuts();
    }

    createPanel() {
        // 创建搜索面板HTML
        const panelHTML = `
            <div id="search-panel" class="search-panel" style="display: none;">
                <div class="search-overlay" id="search-overlay"></div>
                <div class="search-container">
                    <div class="search-header">
                        <div class="search-input-wrapper">
                            <input
                                type="text"
                                id="search-input"
                                placeholder="搜索笔记... (输入 / 打开搜索)"
                                autocomplete="off"
                            >
                            <div class="search-shortcuts">
                                <span class="shortcut">↑↓</span> 切换
                                <span class="shortcut">Enter</span> 打开
                                <span class="shortcut">Esc</span> 关闭
                            </div>
                        </div>
                        <button id="search-close" class="search-close-btn">×</button>
                    </div>

                    <div class="search-filters">
                        <div class="filter-group">
                            <label>主题:</label>
                            <select id="topic-filter">
                                <option value="">全部主题</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>标签:</label>
                            <div id="tags-filter" class="tags-filter"></div>
                        </div>
                        <div class="filter-group">
                            <label>排序:</label>
                            <select id="sort-filter">
                                <option value="relevance">相关度</option>
                                <option value="updatedAt">更新时间</option>
                            </select>
                        </div>
                    </div>

                    <div id="search-results" class="search-results">
                        <div class="search-status">输入关键词开始搜索...</div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
        this.panel = document.getElementById('search-panel');
        this.overlay = document.getElementById('search-overlay');
        this.input = document.getElementById('search-input');
        this.resultsContainer = document.getElementById('search-results');
    }

    bindEvents() {
        // 输入事件
        this.input.addEventListener('input', (e) => {
            this.currentQuery = e.target.value.trim();
            this.performSearch();
        });

        // 键盘导航
        this.input.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectNext();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectPrev();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.openSelected();
                    break;
            }
        });

        // 关闭按钮
        document.getElementById('search-close').addEventListener('click', () => {
            this.close();
        });

        // 点击遮罩关闭
        this.overlay.addEventListener('click', () => {
            this.close();
        });

        // 过滤器事件
        document.getElementById('topic-filter').addEventListener('change', (e) => {
            this.filters.topic = e.target.value;
            this.performSearch();
        });

        document.getElementById('sort-filter').addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.performSearch();
        });
    }

    bindKeyboardShortcuts() {
        // 全局键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 按 / 打开搜索（除了在输入框中）
            if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.open();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.panel.style.display = 'block';
        this.input.focus();
        this.input.select();
        this.updateFilters();
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        this.panel.style.display = 'none';
        this.currentQuery = '';
        this.input.value = '';
        this.results = [];
        this.selectedIndex = 0;
        document.body.style.overflow = '';
    }

    updateFilters() {
        // 更新主题过滤器
        const topicSelect = document.getElementById('topic-filter');
        const topics = this.store.getAllTopics();

        // 清空现有选项（保留"全部主题"）
        while (topicSelect.children.length > 1) {
            topicSelect.removeChild(topicSelect.lastChild);
        }

        // 添加主题选项
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });

        // 更新标签过滤器
        const tagsContainer = document.getElementById('tags-filter');
        const allTags = this.store.getAllTags();

        tagsContainer.innerHTML = '';
        allTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-filter';
            tagElement.textContent = tag;
            tagElement.addEventListener('click', () => {
                this.toggleTag(tag);
            });
            tagsContainer.appendChild(tagElement);
        });
    }

    toggleTag(tag) {
        const index = this.filters.tags.indexOf(tag);
        if (index > -1) {
            this.filters.tags.splice(index, 1);
        } else {
            this.filters.tags.push(tag);
        }
        this.updateTagVisuals();
        this.performSearch();
    }

    updateTagVisuals() {
        const tagElements = document.querySelectorAll('.tag-filter');
        tagElements.forEach(element => {
            const tag = element.textContent;
            if (this.filters.tags.includes(tag)) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        });
    }

    performSearch() {
        if (!this.currentQuery && !this.filters.topic && this.filters.tags.length === 0) {
            this.showStatus('输入关键词开始搜索...');
            return;
        }

        // 执行搜索
        this.results = this.store.searchNotes(this.currentQuery, {
            topic: this.filters.topic,
            tags: this.filters.tags,
            sortBy: this.filters.sortBy
        });

        this.selectedIndex = 0;
        this.renderResults();
    }

    renderResults() {
        if (this.results.length === 0) {
            this.showStatus('未找到匹配的笔记');
            return;
        }

        const resultsHTML = this.results.map((result, index) => {
            const isSelected = index === this.selectedIndex;
            const highlightedText = this.highlightMatches(result.text, this.currentQuery);

            return `
                <div class="search-result ${isSelected ? 'selected' : ''}" data-index="${index}">
                    <div class="result-header">
                        <h3 class="result-title">${this.highlightMatches(result.title, this.currentQuery)}</h3>
                        <div class="result-meta">
                            <span class="result-topic">${result.topic}</span>
                            <span class="result-date">${result.updatedAt}</span>
                        </div>
                    </div>
                    <div class="result-content">${highlightedText}</div>
                    <div class="result-tags">
                        ${result.tags.map(tag => `<span class="result-tag">${tag}</span>`).join('')}
                    </div>
                    ${result.linksOut && result.linksOut.length > 0 ?
                        `<div class="result-links">出链: ${result.linksOut.length} 个笔记</div>` : ''}
                </div>
            `;
        }).join('');

        this.resultsContainer.innerHTML = resultsHTML;

        // 绑定结果点击事件
        document.querySelectorAll('.search-result').forEach((element, index) => {
            element.addEventListener('click', () => {
                this.selectedIndex = index;
                this.openSelected();
            });
        });
    }

    highlightMatches(text, query) {
        if (!query) return text;

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    selectNext() {
        if (this.results.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
        this.updateSelection();
    }

    selectPrev() {
        if (this.results.length === 0) return;
        this.selectedIndex = this.selectedIndex === 0 ? this.results.length - 1 : this.selectedIndex - 1;
        this.updateSelection();
    }

    updateSelection() {
        // 移除所有选中状态
        document.querySelectorAll('.search-result').forEach(el => {
            el.classList.remove('selected');
        });

        // 添加新的选中状态
        const selectedElement = document.querySelector(`.search-result[data-index="${this.selectedIndex}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }

    openSelected() {
        if (this.results.length === 0 || this.selectedIndex >= this.results.length) return;

        const selectedResult = this.results[this.selectedIndex];
        this.close();

        // 跳转到笔记详情页
        this.router.navigate(`/note/${selectedResult.id}`);
    }

    showStatus(message) {
        this.resultsContainer.innerHTML = `<div class="search-status">${message}</div>`;
    }
}