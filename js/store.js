// js/store.js - 数据状态与缓存管理模块
import { loadSearchIndex } from './data.js';
import { SearchOptimizer } from './utils/search-optimizer.js';

class Store {
    constructor() {
        this.searchIndex = null;
        this.noteCache = new Map();
        this.backlinksCache = new Map();
        this.searchOptimizer = new SearchOptimizer();
    }

    // 初始化存储
    async init() {
        try {
            this.searchIndex = await loadSearchIndex();
            this.buildBacklinksCache();
            // 初始化搜索索引
            this.searchOptimizer.updateIndex(this.getNotes());
            console.log('数据存储初始化完成');
        } catch (error) {
            console.error('数据存储初始化失败:', error);
            throw error;
        }
    }

    // 构建反向链接缓存
    buildBacklinksCache() {
        if (!this.searchIndex || !this.searchIndex.items) return;

        // 初始化所有笔记的反向链接为空数组
        this.searchIndex.items.forEach(item => {
            this.backlinksCache.set(item.id, []);
        });

        // 遍历所有笔记，构建反向链接
        this.searchIndex.items.forEach(item => {
            if (item.linksOut && item.linksOut.length > 0) {
                item.linksOut.forEach(targetId => {
                    if (this.backlinksCache.has(targetId)) {
                        this.backlinksCache.get(targetId).push({
                            id: item.id,
                            title: item.title
                        });
                    }
                });
            }
        });
    }

    // 获取笔记列表
    getNotes() {
        return this.searchIndex?.items || [];
    }

    // 根据 ID 获取笔记
    getNoteById(id) {
        return this.searchIndex?.items.find(item => item.id === id);
    }

    // 获取反向链接
    getBacklinks(noteId) {
        return this.backlinksCache.get(noteId) || [];
    }

    // 缓存笔记内容
    cacheNoteContent(noteId, content) {
        this.noteCache.set(noteId, content);
    }

    // 获取缓存的笔记内容
    getCachedNoteContent(noteId) {
        return this.noteCache.get(noteId);
    }

    // 按主题过滤笔记
    getNotesByTopic(topic) {
        return this.getNotes().filter(note => note.topic === topic);
    }

    // 按标签过滤笔记
    getNotesByTag(tag) {
        return this.getNotes().filter(note => (note.tags || []).includes(tag));
    }

    // 搜索笔记（使用优化器）
    async searchNotes(query, options = {}) {
        // 检查查询长度
        if (query && query.length < 2) {
            return [];
        }

        const { topic, tags, sortBy = 'relevance', limit = 20 } = options;

        // 使用优化器进行搜索
        const results = this.searchOptimizer.search(query, this.getNotes(), {
            topic,
            tags,
            sortBy,
            limit
        });

        return results;
    }

    // 获取所有主题
    getAllTopics() {
        const topics = new Set();
        this.getNotes().forEach(note => {
            if (note.topic) topics.add(note.topic);
        });
        return Array.from(topics).sort();
    }

    // 获取所有标签
    getAllTags() {
        const tags = new Set();
        this.getNotes().forEach(note => {
            (note.tags || []).forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }
}

// 创建全局存储实例
export const store = new Store();

// 便捷函数
export const getBacklinks = (noteId) => store.getBacklinks(noteId);
export const getNoteById = (id) => store.getNoteById(id);
export const searchNotes = (query, options) => store.searchNotes(query, options);
