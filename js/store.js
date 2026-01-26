// js/store.js - 数据状态与缓存管理模块
import { loadSearchIndex } from './data.js';

class Store {
    constructor() {
        this.searchIndex = null;
        this.noteCache = new Map();
        this.backlinksCache = new Map();
    }

    // 初始化存储
    async init() {
        try {
            this.searchIndex = await loadSearchIndex();
            this.buildBacklinksCache();
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
        return this.getNotes().filter(note => note.tags.includes(tag));
    }

    // 搜索笔记
    searchNotes(query, options = {}) {
        const { topic, tags, limit = 20 } = options;
        let results = this.getNotes();

        // 按主题过滤
        if (topic) {
            results = results.filter(note => note.topic === topic);
        }

        // 按标签过滤
        if (tags && tags.length > 0) {
            results = results.filter(note =>
                tags.some(tag => note.tags.includes(tag))
            );
        }

        // 文本搜索
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(note =>
                note.title.toLowerCase().includes(lowerQuery) ||
                note.text.toLowerCase().includes(lowerQuery) ||
                note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }

        // 按更新时间排序
        results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return results.slice(0, limit);
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
            note.tags.forEach(tag => tags.add(tag));
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