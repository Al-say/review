// js/router.js - 路由管理模块
export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.renderToken = 0; // 路由渲染并发保护令牌
        this.init();
    }

    init() {
        // 监听 hashchange 事件
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        // 页面加载时处理初始路由
        document.addEventListener('DOMContentLoaded', () => {
            this.handleRoute();
        });
    }

    // 注册路由
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    // 获取当前路由
    getCurrentRoute() {
        const hash = window.location.hash.slice(1) || '/';
        return hash;
    }

    // 处理路由 - 带并发保护
    async handleRoute() {
        const route = this.getCurrentRoute();
        const handler = this.routes[route] || this.routes['/'];

        if (handler) {
            // 增加渲染令牌，防止竞态条件
            const token = ++this.renderToken;

            try {
                // 如果handler是异步函数，等待其完成
                const result = handler(route);

                // 如果返回Promise，等待其完成
                if (result && typeof result.then === 'function') {
                    await result;
                }

                // 检查令牌是否仍然有效（防止旧请求覆盖新请求）
                if (token !== this.renderToken) {
                    console.log('路由渲染被新请求取消:', route);
                    return;
                }

                this.currentRoute = route;
            } catch (error) {
                console.error('路由处理失败:', route, error);
                // 可以在这里添加错误恢复逻辑，比如显示错误页面
            }
        }
    }

    // 导航到指定路由
    navigate(path) {
        window.location.hash = path;
    }
}

// 创建全局路由实例
export const router = new Router();