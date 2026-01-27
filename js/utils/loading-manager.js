// js/utils/loading-manager.js - 加载状态管理
export class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
        this.loadingElements = new Map();
    }

    // 开始加载
    startLoading(key, element = null, message = '加载中...') {
        this.loadingStates.set(key, true);

        if (element) {
            // 保存原始内容
            const originalContent = element.innerHTML;
            this.loadingElements.set(key, { element, originalContent });

            // 显示加载状态
            element.innerHTML = `
                <div class="loading-overlay">
                    <div class="loading-spinner"></div>
                    <div class="loading-message">${message}</div>
                </div>
            `;
        }
    }

    // 结束加载
    endLoading(key) {
        this.loadingStates.set(key, false);

        const loadingInfo = this.loadingElements.get(key);
        if (loadingInfo) {
            // 恢复原始内容
            loadingInfo.element.innerHTML = loadingInfo.originalContent;
            this.loadingElements.delete(key);
        }
    }

    // 检查是否正在加载
    isLoading(key) {
        return this.loadingStates.get(key) || false;
    }

    // 包装异步函数
    wrap(fn, key, element = null, message = '加载中...') {
        return async (...args) => {
            this.startLoading(key, element, message);
            try {
                return await fn(...args);
            } finally {
                this.endLoading(key);
            }
        };
    }

    // 创建加载指示器
    createIndicator(type = 'spinner') {
        const indicators = {
            spinner: `
                <div class="loading-spinner">
                    <div class="spinner-circle"></div>
                </div>
            `,
            dots: `
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `,
            bars: `
                <div class="loading-bars">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `
        };

        return indicators[type] || indicators.spinner;
    }

    // 显示全屏加载
    showFullscreenLoading(message = '加载中...') {
        const existingLoader = document.getElementById('fullscreen-loader');
        if (existingLoader) {
            existingLoader.remove();
        }

        const loader = document.createElement('div');
        loader.id = 'fullscreen-loader';
        loader.className = 'fullscreen-loader';
        loader.innerHTML = `
            <div class="loader-content">
                ${this.createIndicator('spinner')}
                <div class="loader-message">${message}</div>
            </div>
        `;

        // 添加样式
        if (!document.getElementById('fullscreen-loader-style')) {
            const style = document.createElement('style');
            style.id = 'fullscreen-loader-style';
            style.textContent = `
                .fullscreen-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    backdrop-filter: blur(4px);
                }

                .loader-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto 1rem;
                }

                .spinner-circle {
                    width: 100%;
                    height: 100%;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .loading-dots span {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #3498db;
                    margin: 0 2px;
                    animation: bounce 1.4s infinite ease-in-out both;
                }

                .loading-dots span:nth-child(1) {
                    animation-delay: -0.32s;
                }

                .loading-dots span:nth-child(2) {
                    animation-delay: -0.16s;
                }

                .loading-bars {
                    display: flex;
                    gap: 4px;
                    justify-content: center;
                    height: 20px;
                    align-items: flex-end;
                }

                .loading-bars div {
                    width: 4px;
                    height: 100%;
                    background: #3498db;
                    animation: bars 1.2s infinite ease-in-out;
                }

                .loading-bars div:nth-child(1) {
                    animation-delay: -1.2s;
                }

                .loading-bars div:nth-child(2) {
                    animation-delay: -1.1s;
                }

                .loading-bars div:nth-child(3) {
                    animation-delay: -1.0s;
                }

                .loading-bars div:nth-child(4) {
                    animation-delay: -0.9s;
                }

                .loader-message {
                    color: #333;
                    font-size: 14px;
                    margin-top: 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1);
                    }
                }

                @keyframes bars {
                    0%, 40%, 100% {
                        transform: scaleY(0.4);
                    }
                    20% {
                        transform: scaleY(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(loader);
    }

    // 隐藏全屏加载
    hideFullscreenLoading() {
        const loader = document.getElementById('fullscreen-loader');
        if (loader) {
            loader.remove();
        }
    }

    // 更新加载消息
    updateMessage(key, message) {
        const loadingInfo = this.loadingElements.get(key);
        if (loadingInfo) {
            const messageEl = loadingInfo.element.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }

    // 获取加载状态统计
    getStats() {
        return {
            activeLoadings: Array.from(this.loadingStates.entries())
                .filter(([_, isLoading]) => isLoading)
                .map(([key]) => key),
            totalLoadings: this.loadingStates.size
        };
    }
}

// 创建全局加载管理器实例
export const loadingManager = new LoadingManager();