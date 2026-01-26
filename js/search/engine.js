// search/engine.js - 搜索引擎模块
import { search, getAllTags } from '../data.js';
import { debounce } from '../utils.js';

export class SearchEngine {
    constructor(options = {}) {
        this.options = {
            inputSelector: '#search-input',
            resultsSelector: '#search-results',
            tagsSelector: '#search-tags',
            debounceDelay: 300,
            ...options
        };

        this.currentQuery = '';
        this.currentResults = [];
        this.init();
    }

    async init() {
        this.input = document.querySelector(this.options.inputSelector);
        this.results = document.querySelector(this.options.resultsSelector);
        this.tags = document.querySelector(this.options.tagsSelector);

        if (!this.input || !this.results) {
            console.warn('搜索引擎：未找到必要的DOM元素');
            return;
        }

        // 绑定事件
        this.input.addEventListener('input', debounce(this.handleInput.bind(this), this.options.debounceDelay));
        this.input.addEventListener('focus', () => this.showResults());
        document.addEventListener('click', (e) => this.handleClickOutside(e));

        // 初始化标签
        await this.loadTags();

        console.log('搜索引擎初始化完成');
    }

    async handleInput(e) {
        const query = e.target.value.trim();
        this.currentQuery = query;

        if (query === '') {
            this.hideResults();
            return;
        }

        try {
            this.currentResults = await search(query);
            this.renderResults();
            this.showResults();
        } catch (error) {
            console.error('搜索失败:', error);
            this.showError('搜索时发生错误');
        }
    }

    renderResults() {
        if (!this.results) return;

        if (this.currentResults.length === 0) {
            this.results.innerHTML = `
                <div class="search-no-results">
                    <p>未找到包含 "${this.currentQuery}" 的内容</p>
                    <small>尝试使用其他关键词</small>
                </div>
            `;
            return;
        }

        const html = this.currentResults.map(item => `
            <div class="search-result-item" data-id="${item.id}">
                <h4 class="search-result-title">
                    <a href="#/note/${item.id}">${this.highlightText(item.title, this.currentQuery)}</a>
                </h4>
                <p class="search-result-text">${this.highlightText(item.text.substring(0, 150), this.currentQuery)}...</p>
                <div class="search-result-meta">
                    <span class="search-result-topic">${item.topic || '未分类'}</span>
                    <span class="search-result-date">${new Date(item.updatedAt).toLocaleDateString('zh-CN')}</span>
                    ${item.tags ? `<div class="search-result-tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                </div>
            </div>
        `).join('');

        this.results.innerHTML = html;
    }

    highlightText(text, query) {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    async loadTags() {
        if (!this.tags) return;

        try {
            const allTags = await getAllTags();
            const html = allTags.map(tag => `
                <button class="tag-button" data-tag="${tag}">${tag}</button>
            `).join('');

            this.tags.innerHTML = html;

            // 绑定标签点击事件
            this.tags.querySelectorAll('.tag-button').forEach(button => {
                button.addEventListener('click', () => {
                    const tag = button.dataset.tag;
                    this.input.value = tag;
                    this.handleInput({ target: this.input });
                });
            });
        } catch (error) {
            console.error('加载标签失败:', error);
        }
    }

    showResults() {
        if (this.results) {
            this.results.style.display = 'block';
        }
    }

    hideResults() {
        if (this.results) {
            this.results.style.display = 'none';
        }
    }

    showError(message) {
        if (this.results) {
            this.results.innerHTML = `
                <div class="search-error">
                    <p>${message}</p>
                </div>
            `;
            this.showResults();
        }
    }

    handleClickOutside(e) {
        if (!this.input?.contains(e.target) && !this.results?.contains(e.target)) {
            this.hideResults();
        }
    }

    destroy() {
        // 清理事件监听器
        if (this.input) {
            this.input.removeEventListener('input', this.handleInput);
            this.input.removeEventListener('focus', this.showResults);
        }
        document.removeEventListener('click', this.handleClickOutside);
    }
}

// 默认导出工厂函数
export function createSearchEngine(options) {
    return new SearchEngine(options);
}