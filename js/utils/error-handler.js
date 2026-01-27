// js/utils/error-handler.js - 全局错误处理模块
export class ErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 5;
        this.errorCallbacks = [];
        this.init();
    }

    init() {
        // 如果不在浏览器环境中，则不执行任何操作
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
            event.preventDefault();
        });

        // 捕获全局错误
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'Global Error');
            event.preventDefault();
        });
    }

    // 处理错误
    handleError(error, context = '') {
        this.errorCount++;
        console.error(`[${context}] Error:`, error);

        // 创建错误对象
        const errorObj = {
            message: error.message || 'Unknown error',
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            count: this.errorCount
        };

        // 通知错误回调
        this.notifyErrorCallbacks(errorObj);

        // 如果错误过多，显示用户友好的消息
        if (this.errorCount >= this.maxErrors) {
            this.showUserFriendlyError();
        }
    }

    // 添加错误回调
    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    // 通知错误回调
    notifyErrorCallbacks(errorObj) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(errorObj);
            } catch (e) {
                console.error('Error in error callback:', e);
            }
        });
    }

    // 显示用户友好的错误
    showUserFriendlyError() {
        const message = '应用遇到一些问题，请刷新页面重试。如果问题持续存在，请联系开发者。';
        this.showToast(message, 'error');
    }

    // 显示提示消息
    showToast(message, type = 'info', duration = 3000) {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            console.log(`[Toast] ${type}: ${message}`);
            return;
        }

        // 移除现有的toast
        const existingToast = document.querySelector('.error-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建新的toast
        const toast = document.createElement('div');
        toast.className = `error-toast error-toast-${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .error-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .error-toast-error {
                background-color: #dc3545;
            }

            .error-toast-info {
                background-color: #17a2b8;
            }

            .error-toast-success {
                background-color: #28a745;
            }

            .error-toast-warning {
                background-color: #ffc107;
                color: #212529;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        // 自动消失
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    // 包装函数以添加错误处理
    wrap(fn, context = '') {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handleError(error, context);
                throw error;
            }
        };
    }

    // 创建错误边界组件
    createErrorBoundary(componentName) {
        return {
            catchError: (error) => {
                this.handleError(error, `${componentName} Error Boundary`);
            },
            renderFallback: (error) => {
                return `
                    <div class="error-boundary" role="alert">
                        <h3>组件出错</h3>
                        <p>组件 ${componentName} 遇到了问题。</p>
                        <button onclick="location.reload()">刷新页面</button>
                    </div>
                `;
            }
        };
    }

    // 验证数据
    validateData(data, schema) {
        const errors = [];

        for (const [key, value] of Object.entries(schema)) {
            if (value.required && !(key in data)) {
                errors.push(`缺少必需字段: ${key}`);
            } else if (key in data && typeof data[key] !== value.type) {
                errors.push(`字段 ${key} 类型应为 ${value.type}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`数据验证失败: ${errors.join(', ')}`);
        }

        return true;
    }

    // 获取错误统计
    getStats() {
        return {
            errorCount: this.errorCount,
            maxErrors: this.maxErrors
        };
    }

    // 重置错误计数
    reset() {
        this.errorCount = 0;
    }
}

// 创建全局错误处理器实例
export const errorHandler = new ErrorHandler();