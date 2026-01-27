// js/utils/pwa-handler.js - PWA 功能处理
export class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        // 检查是否支持 Service Worker
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }

        // 检查是否已安装
        this.checkInstalled();

        // 监听 beforeinstallprompt 事件
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // 监听 appinstalled 事件
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            this.showToast('应用已安装成功！', 'success');
        });

        // 监听在线/离线状态
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    // 注册 Service Worker
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);

            // 等待 Service Worker 激活
            if (registration.active) {
                console.log('Service Worker is active');
            } else {
                registration.addEventListener('updatefound', () => {
                    const installingWorker = registration.installing;
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'activated') {
                            console.log('Service Worker activated');
                        }
                    });
                });
            }

            // 监听 Service Worker 控制权获取
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Controller changed');
                window.location.reload();
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    // 检查是否已安装
    checkInstalled() {
        // 检查 localStorage 中的安装标记
        this.isInstalled = localStorage.getItem('pwa-installed') === 'true';

        // 检查是否作为独立应用运行
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }

        // 检查是否作为全屏应用运行
        if (window.navigator.standalone) {
            this.isInstalled = true;
        }

        if (this.isInstalled) {
            this.hideInstallButton();
        }
    }

    // 显示安装按钮
    showInstallButton() {
        const installButton = document.getElementById('install-button');
        if (installButton && !this.isInstalled) {
            installButton.style.display = 'flex';
            installButton.addEventListener('click', () => this.install());
        }
    }

    // 隐藏安装按钮
    hideInstallButton() {
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    // 安装应用
    async install() {
        if (!this.deferredPrompt) {
            this.showToast('无法安装应用，请稍后重试', 'error');
            return;
        }

        try {
            // 触发安装提示
            const result = await this.deferredPrompt.prompt();
            console.log('Install prompt result:', result);

            if (result.outcome === 'accepted') {
                this.isInstalled = true;
                localStorage.setItem('pwa-installed', 'true');
                this.hideInstallButton();
                this.showToast('应用安装成功！', 'success');
            } else {
                this.showToast('安装已取消', 'info');
            }

            // 清除 deferredPrompt
            this.deferredPrompt = null;
        } catch (error) {
            console.error('Install failed:', error);
            this.showToast('安装失败，请重试', 'error');
        }
    }

    // 处理在线状态
    handleOnline() {
        console.log('App is online');

        // 更新在线状态
        document.body.classList.remove('offline');
        document.body.classList.add('online');

        // 显示在线提示
        this.showToast('网络已恢复', 'success');

        // 如果有同步需求，可以在这里触发
        this.syncData();
    }

    // 处理离线状态
    handleOffline() {
        console.log('App is offline');

        // 更新离线状态
        document.body.classList.remove('online');
        document.body.classList.add('offline');

        // 显示离线提示
        this.showToast('当前处于离线模式', 'info');

        // 保存数据到 IndexedDB 以便后续同步
        this.saveForSync();
    }

    // 保存数据用于同步
    async saveForSync() {
        try {
            // 打开 IndexedDB
            const db = await this.openDB();

            // 保存当前状态
            const syncData = {
                timestamp: Date.now(),
                url: window.location.href,
                data: this.getAppState()
            };

            const transaction = db.transaction(['sync-data'], 'readwrite');
            const store = transaction.objectStore('sync-data');
            store.put(syncData);

            console.log('Data saved for sync');
        } catch (error) {
            console.error('Failed to save data for sync:', error);
        }
    }

    // 打开 IndexedDB
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('pwa-db', 1);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建 sync-data store
                if (!db.objectStoreNames.contains('sync-data')) {
                    db.createObjectStore('sync-data', { keyPath: 'id', autoIncrement: true });
                }

                // 创建 settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // 获取应用状态
    getAppState() {
        return {
            scrollPosition: window.pageYOffset,
            searchHistory: JSON.parse(localStorage.getItem('search-history') || '[]'),
            theme: localStorage.getItem('theme') || 'dark',
            fontSize: localStorage.getItem('font-size') || '16'
        };
    }

    // 同步数据
    async syncData() {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(['sync-data'], 'readonly');
            const store = transaction.objectStore('sync-data');
            const getAll = store.getAll();

            getAll.onsuccess = async () => {
                const syncData = getAll.result;

                if (syncData.length > 0) {
                    console.log('Syncing data:', syncData);

                    // 这里可以添加实际的同步逻辑
                    // 例如发送数据到服务器

                    // 清理已同步的数据
                    const cleanupTransaction = db.transaction(['sync-data'], 'readwrite');
                    const cleanupStore = cleanupTransaction.objectStore('sync-data');
                    cleanupStore.clear();
                }
            };
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    // 获取 PWA 状态
    getStatus() {
        return {
            isInstalled: this.isInstalled,
            supportsInstall: !!this.deferredPrompt,
            online: navigator.onLine,
            serviceWorker: 'serviceWorker' in navigator
        };
    }

    // 显示通知
    showNotification(title, options = {}) {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            new Notification(title, options);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    new Notification(title, options);
                }
            });
        }
    }

    // 请求通知权限
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        // 创建 toast 元素
        const toast = document.createElement('div');
        toast.className = `pwa-toast pwa-toast-${type}`;
        toast.textContent = message;

        // 添加样式
        const style = document.createElement('style');
        if (!document.getElementById('pwa-toast-style')) {
            style.id = 'pwa-toast-style';
            style.textContent = `
                .pwa-toast {
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

                .pwa-toast-info {
                    background-color: #17a2b8;
                }

                .pwa-toast-success {
                    background-color: #28a745;
                }

                .pwa-toast-error {
                    background-color: #dc3545;
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
        }

        document.body.appendChild(toast);

        // 自动消失
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
}

// 创建全局 PWA 处理器实例
export const pwaHandler = new PWAHandler();