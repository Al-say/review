// js/router.js - 路由管理模块
export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
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

    // 处理路由
    handleRoute() {
        const route = this.getCurrentRoute();
        const handler = this.routes[route] || this.routes['/'];

        if (handler) {
            this.currentRoute = route;
            handler(route);
        }
    }

    // 导航到指定路由
    navigate(path) {
        window.location.hash = path;
    }
}

// 创建全局路由实例
export const router = new Router();