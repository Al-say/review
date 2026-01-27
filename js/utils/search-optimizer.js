// js/utils/search-optimizer.js - 搜索性能优化模块
export class SearchOptimizer {
    constructor() {
        this.searchCache = new Map();
        this.cacheSize = 50; // 缓存最近50次搜索结果
        this.debounceDelay = 150; // 降低防抖延迟到150ms
        this.minQueryLength = 2; // 最小查询长度
        this.tokenizeRegex = /[^\u4e00-\u9fa5a-zA-Z0-9\s]/g;
        this.stopWords = new Set([
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '它', '他', '她', '们', '我们', '你们', '他们', '它们', '这个', '那个', '这些', '那些', '什么', '怎么', '为什么', '哪里', '何时', '谁', '如何', '哪个'
        ]);
        this.buildIndex();
    }

    // 构建搜索索引
    buildIndex() {
        this.wordIndex = new Map();
        this.titleIndex = new Map();
        this.tagIndex = new Map();
    }

    // 更新索引
    updateIndex(notes) {
        // 清空现有索引
        this.wordIndex.clear();
        this.titleIndex.clear();
        this.tagIndex.clear();

        // 构建新索引
        notes.forEach(note => {
            // 标题索引
            if (note.title) {
                const titleWords = this.tokenize(note.title);
                titleWords.forEach(word => {
                    if (!this.titleIndex.has(word)) {
                        this.titleIndex.set(word, new Set());
                    }
                    this.titleIndex.get(word).add(note.id);
                });
            }

            // 标签索引
            if (note.tags && note.tags.length > 0) {
                note.tags.forEach(tag => {
                    const tagWords = this.tokenize(tag);
                    tagWords.forEach(word => {
                        if (!this.tagIndex.has(word)) {
                            this.tagIndex.set(word, new Set());
                        }
                        this.tagIndex.get(word).add(note.id);
                    });
                });
            }

            // 内容索引
            if (note.text) {
                const contentWords = this.tokenize(note.text);
                const wordFreq = new Map();

                // 计算词频
                contentWords.forEach(word => {
                    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
                });

                // 更新索引
                wordFreq.forEach((freq, word) => {
                    if (!this.wordIndex.has(word)) {
                        this.wordIndex.set(word, new Map());
                    }
                    this.wordIndex.get(word).set(note.id, freq);
                });
            }
        });
    }

    // 分词函数
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(this.tokenizeRegex, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1 && !this.stopWords.has(word));
    }

    // 计算相关度分数
    calculateScore(note, query, options = {}) {
        let score = 0;
        const lowerQuery = query.toLowerCase();
        const words = this.tokenize(query);

        // 标题匹配权重最高
        if (note.title && note.title.toLowerCase().includes(lowerQuery)) {
            score += 1000;
        }

        // 标题完全匹配
        if (note.title && note.title.toLowerCase() === lowerQuery) {
            score += 500;
        }

        // 每个匹配的词
        words.forEach(word => {
            // 标签匹配
            if (note.tags && note.tags.some(tag => tag.toLowerCase().includes(word))) {
                score += 200;
            }

            // 标题词匹配
            if (this.titleIndex.has(word) && this.titleIndex.get(word).has(note.id)) {
                score += 150;
            }

            // 内容词匹配
            if (this.wordIndex.has(word) && this.wordIndex.get(word).has(note.id)) {
                const freq = this.wordIndex.get(word).get(note.id);
                score += freq * 10;
            }
        });

        // 时间衰减因子
        const daysSinceUpdate = (Date.now() - new Date(note.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        const timeDecay = Math.max(0.5, 1 - daysSinceUpdate / 365);
        score *= timeDecay;

        // 标签和主题的精确匹配加分
        if (options.tags && options.tags.length > 0) {
            const tagMatches = options.tags.filter(tag =>
                note.tags && note.tags.includes(tag)
            ).length;
            score += tagMatches * 50;
        }

        if (options.topic && note.topic === options.topic) {
            score += 300;
        }

        return score;
    }

    // 优化的搜索函数
    search(query, notes, options = {}) {
        const { topic, tags = [], sortBy = 'relevance', limit = 20 } = options;
        const cacheKey = `${query}-${topic}-${tags.join(',')}-${sortBy}-${limit}`;

        // 检查缓存
        if (this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey);
        }

        // 预处理
        let results = [...notes];

        // 按主题过滤
        if (topic) {
            results = results.filter(note => note.topic === topic);
        }

        // 按标签过滤
        if (tags && tags.length > 0) {
            results = results.filter(note =>
                tags.some(tag => (note.tags || []).includes(tag))
            );
        }

        // 文本搜索
        if (query && query.length >= this.minQueryLength) {
            const queryWords = this.tokenize(query);
            const matchedNoteIds = new Set();

            // 从索引中获取匹配的笔记ID
            queryWords.forEach(word => {
                if (this.titleIndex.has(word)) {
                    this.titleIndex.get(word).forEach(id => matchedNoteIds.add(id));
                }
                if (this.tagIndex.has(word)) {
                    this.tagIndex.get(word).forEach(id => matchedNoteIds.add(id));
                }
                if (this.wordIndex.has(word)) {
                    this.wordIndex.get(word).forEach((freq, id) => matchedNoteIds.add(id));
                }
            });

            // 使用索引结果过滤笔记
            results = results.filter(note => matchedNoteIds.has(note.id));

            // 计算相关度分数
            results = results.map(note => ({
                ...note,
                _score: this.calculateScore(note, query, options)
            }));

            // 按相关度排序
            if (sortBy === 'relevance') {
                results.sort((a, b) => b._score - a._score);
            }
        } else if (sortBy === 'relevance') {
            // 无查询时按更新时间排序
            results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }

        // 移除临时分数
        results = results.map(({ _score, ...note }) => note);

        // 限制结果数量
        const finalResults = results.slice(0, limit);

        // 缓存结果
        this.searchCache.set(cacheKey, finalResults);

        // 维护缓存大小
        if (this.searchCache.size > this.cacheSize) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }

        return finalResults;
    }

    // 优化的高亮函数
    highlightText(text, query) {
        if (!query || query.length < this.minQueryLength) return text;

        const words = this.tokenize(query);
        let result = text;

        words.forEach(word => {
            if (word.length > 1) {
                const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
                result = result.replace(regex, '<mark>$1</mark>');
            }
        });

        return result;
    }

    // 转义正则表达式特殊字符
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 清除缓存
    clearCache() {
        this.searchCache.clear();
    }

    // 获取缓存统计
    getCacheStats() {
        return {
            size: this.searchCache.size,
            maxSize: this.cacheSize,
            hitRate: 0 // 可以扩展实现命中率统计
        };
    }
}