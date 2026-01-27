// js/utils/lazy-loader.js - 懒加载工具
export class LazyLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.loadingPromises = new Map();
        this.intersectionObserver = null;
        this.setupIntersectionObserver();
    }

    // 设置 Intersection Observer
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const componentId = entry.target.dataset.lazyComponent;
                    if (componentId && !this.loadedComponents.has(componentId)) {
                        this.loadComponent(componentId);
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        });
    }

    // 加载组件
    async loadComponent(componentId) {
        // 如果组件已经加载，直接返回
        if (this.loadedComponents.has(componentId)) {
            return true;
        }

        // 如果组件正在加载，返回现有的 Promise
        if (this.loadingPromises.has(componentId)) {
            return this.loadingPromises.get(componentId);
        }

        // 创建新的加载 Promise
        const loadPromise = this.internalLoadComponent(componentId);
        this.loadingPromises.set(componentId, loadPromise);

        try {
            await loadPromise;
            return true;
        } catch (error) {
            console.error(`Failed to load component ${componentId}:`, error);
            this.loadingPromises.delete(componentId);
            throw error;
        }
    }

    // 内部加载组件的实现
    async internalLoadComponent(componentId) {
        const componentConfigs = {
            'graph-view': {
                module: () => import('../render/graph-view.js'),
                component: 'GraphRenderer',
                styles: ['css/graph.css']
            },
            'timeline-view': {
                module: () => import('../render/timeline-view.js'),
                component: 'TimelineRenderer',
                styles: ['css/timeline.css']
            },
            'note-detail': {
                module: () => import('../render/note-detail.js'),
                component: 'NoteDetailRenderer',
                styles: ['css/note-detail.css']
            }
        };

        const config = componentConfigs[componentId];
        if (!config) {
            throw new Error(`Unknown component: ${componentId}`);
        }

        try {
            // 加载样式
            if (config.styles && config.styles.length > 0) {
                await Promise.all(config.styles.map(style => this.loadStyle(style)));
            }

            // 加载模块
            const module = await config.module();

            // 标记组件已加载
            this.loadedComponents.add(componentId);
            this.loadingPromises.delete(componentId);

            return module[config.component];
        } catch (error) {
            console.error(`Failed to load component ${componentId}:`, error);
            throw error;
        }
    }

    // 加载 CSS 文件
    loadStyle(href) {
        return new Promise((resolve, reject) => {
            // 检查是否已经加载
            const existingLink = document.querySelector(`link[href="${href}"]`);
            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;

            link.onload = resolve;
            link.onerror = () => reject(new Error(`Failed to load style: ${href}`));

            document.head.appendChild(link);
        });
    }

    // 注册懒加载元素
    register(element, componentId) {
        element.dataset.lazyComponent = componentId;
        this.intersectionObserver.observe(element);
    }

    // 取消注册懒加载元素
    unregister(element) {
        this.intersectionObserver.unobserve(element);
    }

    // 手动加载组件
    async preload(componentId) {
        return this.loadComponent(componentId);
    }

    // 获取已加载的组件列表
    getLoadedComponents() {
        return Array.from(this.loadedComponents);
    }

    // 清理
    destroy() {
        this.intersectionObserver.disconnect();
        this.loadedComponents.clear();
        this.loadingPromises.clear();
    }
}

// 创建全局懒加载器实例
export const lazyLoader = new LazyLoader();