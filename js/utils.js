// utils.js - 工具函数模块

/**
 * 基于document.baseURI生成完整URL，确保在不同域名环境下路径正确
 * @param {string} path - 相对路径
 * @returns {string} 完整URL
 */
export function urlOf(path) {
  return new URL(path, document.baseURI).toString();
}

/**
 * DOM节点断言函数 - 确保关键节点存在
 * @param {string} id - 元素ID
 * @returns {HTMLElement} DOM元素
 * @throws {Error} 如果元素不存在
 */
export function mustGet(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing DOM element: #${id}`);
  return el;
}

/**
 * 可选DOM节点获取 - 不抛出错误
 * @param {string} id - 元素ID
 * @returns {HTMLElement|null} DOM元素或null
 */
export function optionalGet(id) {
  return document.getElementById(id);
}

/**
 * 可选DOM查询 - 不抛出错误
 * @param {string} selector - CSS选择器
 * @returns {Element|null} 匹配的元素或null
 */
export function optionalQuery(selector) {
  return document.querySelector(selector);
}

/**
 * 安全的JSON解析
 * @param {string} text - JSON字符串
 * @returns {any} 解析后的对象
 * @throws {Error} 如果解析失败
 */
export function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`JSON parse failed: ${error.message}`);
  }
}

export function initSmoothScroll() {
    // 平滑滚动 - 只对页面内锚点链接生效，不拦截路由链接
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // 跳过路由链接（如 #/note/xxx）和空锚点
            if (href.startsWith('#/') || href === '#' || href === '') {
                return;
            }
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 防抖函数
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 格式化日期
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Intl.DateTimeFormat('zh-CN', { ...defaultOptions, ...options }).format(date);
}

// 获取相对时间
export function getRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: '年', seconds: 31536000 },
        { label: '月', seconds: 2592000 },
        { label: '周', seconds: 604800 },
        { label: '天', seconds: 86400 },
        { label: '小时', seconds: 3600 },
        { label: '分钟', seconds: 60 },
        { label: '秒', seconds: 1 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label}前`;
        }
    }

    return '刚刚';
}

/**
 * HTML 转义函数 - 防止 XSS 攻击
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的 HTML 安全字符串
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}