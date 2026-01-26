// data.js - 数据处理模块
import { BASE_URL } from './app.js';

let searchData = null;
let graphData = null;

// 安全的JSON获取函数
async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return res.json();
}

// 安全的文本获取函数
async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return res.text();
}

// 搜索索引结构断言
function assertSearchIndex(data) {
  if (!data || !Array.isArray(data.items)) throw new Error("Invalid search index: items missing");
  for (const it of data.items) {
    if (!it.id || !it.title) throw new Error(`Invalid item: id/title missing for ${it.id || 'unknown'}`);
  }
  return data;
}

// 加载搜索索引（重命名以保持一致性）
export async function loadSearchIndex() {
    if (searchData) return searchData;

    try {
        const url = new URL("data/search.json", BASE_URL).toString();
        const data = await fetchJson(url);
        searchData = assertSearchIndex(data);
        console.log('搜索索引加载完成:', searchData.items?.length || 0, '个项目');
        return searchData;
    } catch (error) {
        console.error('加载搜索索引失败:', error);
        return { items: [], version: 1, generatedAt: new Date().toISOString() };
    }
}

// 加载笔记内容
export async function loadNoteContent(noteId) {
    const index = await loadSearchIndex();
    const note = index.items.find(item => item.id === noteId);

    if (!note) return null;

    try {
        const url = new URL(note.path, BASE_URL).toString();
        const content = await fetchText(url);

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
        const url = new URL("data/graph.json", BASE_URL).toString();
        graphData = await fetchJson(url);
        console.log('图谱数据加载完成:', graphData.nodes?.length || 0, '个节点');
        return graphData;
    } catch (error) {
        console.error('加载图谱数据失败:', error);
        return { nodes: [], edges: [] };
    }
}

// 搜索功能
export async function search(query, options = {}) {
    const data = await loadSearchData();
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
    const data = await loadSearchData();
    return data.items.find(item => item.id === id);
}

// 获取所有标签
export async function getAllTags() {
    const data = await loadSearchData();
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
    const data = await loadSearchData();
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