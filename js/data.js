// data.js - 数据处理模块
import { urlOf, safeJsonParse } from './utils.js';

let searchData = null;
let graphData = null;

// 安全的JSON获取函数
export async function fetchJson(path) {
  const res = await fetch(urlOf(path), { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${path}`);
  const text = await res.text();
  return safeJsonParse(text);
}

// 安全的文本获取函数
export async function fetchText(path) {
  const res = await fetch(urlOf(path), { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${path}`);
  return res.text();
}

// 搜索索引结构断言 - 增强版本校验
function assertSearchIndex(data) {
  if (!data) throw new Error("Search index is null or undefined");

  // 版本校验
  if (typeof data.version !== "number") throw new Error("Invalid search index: version missing or not a number");

  // 生成时间校验
  if (!data.generatedAt || typeof data.generatedAt !== "string") {
    console.warn("Search index missing generatedAt timestamp");
  }

  // 项目数组校验
  if (!Array.isArray(data.items)) throw new Error("Invalid search index: items missing or not an array");

  // 每个项目的基本字段校验
  for (const item of data.items) {
    if (!item.id || typeof item.id !== "string") {
      throw new Error(`Invalid item: id missing or not a string for item ${JSON.stringify(item)}`);
    }
    if (!item.title || typeof item.title !== "string") {
      throw new Error(`Invalid item: title missing or not a string for item ${item.id}`);
    }
  }

  return data;
}

// 加载搜索索引（重命名以保持一致性）
export async function loadSearchIndex() {
    if (searchData) return searchData;

    try {
        const data = await fetchJson("data/search.json");
        searchData = assertSearchIndex(data);
        console.log('搜索索引加载完成:', searchData.items?.length || 0, '个项目');
        return searchData;
    } catch (error) {
        console.error('加载搜索索引失败:', error);
        // 降级到空索引，避免完全崩溃
        return {
            items: [],
            version: 1,
            generatedAt: new Date().toISOString(),
            error: error.message
        };
    }
}

// 加载笔记内容
export async function loadNoteContent(noteId) {
    const index = await loadSearchIndex();
    const note = index.items.find(item => item.id === noteId);

    if (!note) return null;

    try {
        const content = await fetchText(note.path);

        // 解析 Front Matter
        const { metadata, content: bodyContent } = parseFrontMatter(content);

        return {
            ...note,
            ...metadata,
            content: bodyContent
        };
    } catch (error) {
        console.error(`加载笔记内容失败 ${noteId}:`, error);
        return null;
    }
}

// 解析 Front Matter
function parseFrontMatter(content) {
    const lines = content.split('\n');
    const metadata = {};

    if (lines[0].trim() === '---') {
        let endIndex = -1;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                endIndex = i;
                break;
            }
            const line = lines[i].trim();
            if (line.includes(':')) {
                const [key, ...valueParts] = line.split(':');
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        }
        if (endIndex > 0) {
            return {
                metadata,
                content: lines.slice(endIndex + 1).join('\n').trim()
            };
        }
    }

    return { metadata, content: content.trim() };
}

// 加载图谱数据
export async function loadGraphData() {
    if (graphData) return graphData;

    try {
        graphData = await fetchJson("data/graph.json");
        if (!graphData.links && graphData.edges) {
            graphData.links = graphData.edges;
        }
        console.log('图谱数据加载完成:', graphData.nodes?.length || 0, '个节点');
        return graphData;
    } catch (error) {
        console.error('加载图谱数据失败:', error);
        return { nodes: [], links: [] };
    }
}

// 搜索功能
export async function search(query, options = {}) {
    const data = await loadSearchIndex();
    const { limit = 10, caseSensitive = false } = options;

    if (!query || query.trim() === '') {
        return data.items.slice(0, limit);
    }

    const searchTerm = caseSensitive ? query : query.toLowerCase();

    const results = data.items.filter(item => {
        const title = caseSensitive ? item.title : item.title.toLowerCase();
        const text = caseSensitive ? item.text : item.text.toLowerCase();
        const tags = item.tags ? item.tags.join(' ') : '';

        return title.includes(searchTerm) ||
               text.includes(searchTerm) ||
               tags.includes(searchTerm);
    });

    return results.slice(0, limit);
}

// 获取笔记详情
export async function getNote(id) {
    const data = await loadSearchIndex();
    return data.items.find(item => item.id === id);
}

// 获取所有标签
export async function getAllTags() {
    const data = await loadSearchIndex();
    const tagSet = new Set();

    data.items.forEach(item => {
        if (item.tags) {
            item.tags.forEach(tag => tagSet.add(tag));
        }
    });

    return Array.from(tagSet).sort();
}

// 获取按主题分组的笔记
export async function getNotesByTopic() {
    const data = await loadSearchIndex();
    const topics = {};

    data.items.forEach(item => {
        const topic = item.topic || '未分类';
        if (!topics[topic]) {
            topics[topic] = [];
        }
        topics[topic].push(item);
    });

    return topics;
}

// 按时间获取笔记（用于时间线）
export async function getNotesByTime() {
    const data = await loadSearchIndex();
    return data.items
        .map(item => ({
            ...item,
            date: new Date(item.updatedAt || item.createdAt)
        }))
        .sort((a, b) => b.date - a.date);
}
