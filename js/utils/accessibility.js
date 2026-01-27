// js/utils/accessibility.js - 无障碍访问支持
export class AccessibilityManager {
    constructor() {
        this.currentFocusableElement = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        this.screenReader = this.detectScreenReader();
        this.init();
    }

    init() {
        // 设置 ARIA 标签
        this.setupARIALabels();

        // 改善键盘导航
        this.setupKeyboardNavigation();

        // 添加屏幕阅读器支持
        this.setupScreenReaderSupport();

        // 添加焦点指示器
        this.setupFocusIndicators();

        // 监听偏好变化
        this.setupPreferenceListeners();

        // 添加跳过导航链接
        this.addSkipLinks();

        // 改善表单标签
        this.improveFormLabels();

        // 添加实时区域
        this.setupLiveRegions();
    }

    // 检测屏幕阅读器
    detectScreenReader() {
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('nvda') ||
               ua.includes('nonvisual') ||
               ua.includes('freedom scientific') ||
               ua.includes('jaws') ||
               (window.outerHeight > 0 && window.outerWidth === 0);
    }

    // 设置 ARIA 标签
    setupARIALabels() {
        // 为所有按钮添加 aria-labels
        document.querySelectorAll('button').forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                button.setAttribute('aria-label', '按钮');
            }
        });

        // 为所有链接添加适当的 roles
        document.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
                link.setAttribute('role', 'link');
                link.setAttribute('aria-current', page === link.getAttribute('href').slice(1) ? 'page' : 'false');
            }
        });

        // 为图片添加 alt 文本
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.setAttribute('alt', '图片');
        });

        // 为图标添加 aria-hidden
        document.querySelectorAll('svg[aria-hidden="false"]').forEach(svg => {
            if (!svg.getAttribute('aria-label') && !svg.getAttribute('aria-labelledby')) {
                svg.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // 设置键盘导航
    setupKeyboardNavigation() {
        // 添加 Tab 键导航支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // 添加 Enter 键激活支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('clickable')) {
                e.target.click();
            }
        });

        // 添加 Escape 键关闭支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });

        // 为所有交互元素添加 focusable
        document.querySelectorAll('button, [href], input, select, textarea, [tabindex]').forEach(element => {
            if (!element.getAttribute('tabindex') || parseInt(element.getAttribute('tabindex')) < 0) {
                element.setAttribute('tabindex', '0');
            }
        });
    }

    // 处理 Tab 导航
    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab 在第一个元素时循环到最后一个
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
        // Tab 在最后一个元素时循环到第一个
        else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    // 处理 Escape 键
    handleEscapeKey(e) {
        // 关闭模态框
        const modal = document.querySelector('.modal.active');
        if (modal) {
            e.preventDefault();
            this.closeModal(modal);
        }

        // 关闭菜单
        const menu = document.querySelector('.menu.active');
        if (menu) {
            e.preventDefault();
            menu.classList.remove('active');
        }
    }

    // 设置屏幕阅读器支持
    setupScreenReaderSupport() {
        // 为动态内容添加 aria-live
        const dynamicContainer = document.createElement('div');
        dynamicContainer.setAttribute('aria-live', 'polite');
        dynamicContainer.setAttribute('aria-atomic', 'true');
        dynamicContainer.className = 'sr-only';
        dynamicContainer.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
        document.body.appendChild(dynamicContainer);
        this.srContainer = dynamicContainer;

        // 为状态变化添加屏幕阅读器通知
        window.addEventListener('load', () => {
            this.announceToScreenReader('页面加载完成');
        });
    }

    // 设置焦点指示器
    setupFocusIndicators() {
        // 移除默认焦点样式
        document.querySelector('style')?.insertAdjacentText('beforeend', `
            *:focus {
                outline: none;
            }
        `);

        // 添加自定义焦点样式
        const style = document.createElement('style');
        style.textContent = `
            .focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);

        // 监听 focus-visible
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.querySelectorAll('.focus-visible').forEach(el => {
                    el.classList.add('focus-visible');
                });
            }
        });

        document.addEventListener('mousedown', () => {
            document.querySelectorAll('.focus-visible').forEach(el => {
                el.classList.remove('focus-visible');
            });
        });
    }

    // 设置偏好监听
    setupPreferenceListeners() {
        // 监听减少动画偏好
        window.matchMedia('(prefers-reduced-motion: reduce)').addListener((e) => {
            this.isReducedMotion = e.matches;
            this.updateAnimations();
        });

        // 监听高对比度偏好
        window.matchMedia('(prefers-contrast: high)').addListener((e) => {
            this.isHighContrast = e.matches;
            this.updateContrast();
        });
    }

    // 添加跳过导航链接
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = '跳转到主要内容';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 0 0 4px 0;
            z-index: 100;
            transition: top 0.3s;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // 改善表单标签
    improveFormLabels() {
        document.querySelectorAll('input, select, textarea').forEach(element => {
            if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                const label = element.closest('label');
                if (label) {
                    element.setAttribute('aria-labelledby', label.id || `label-${Date.now()}`);
                    if (!label.id) {
                        label.id = `label-${Date.now()}`;
                    }
                }
            }
        });

        // 为所有表单添加 aria-required
        document.querySelectorAll('[required]').forEach(element => {
            element.setAttribute('aria-required', 'true');
        });
    }

    // 设置实时区域
    setupLiveRegions() {
        // 为搜索结果添加实时区域
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.setAttribute('aria-live', 'polite');
            searchResults.setAttribute('aria-atomic', 'true');
        }

        // 为笔记列表添加实时区域
        const notesGrid = document.querySelector('.notes-grid');
        if (notesGrid) {
            notesGrid.setAttribute('aria-live', 'polite');
            notesGrid.setAttribute('aria-atomic', 'true');
        }
    }

    // 更新动画
    updateAnimations() {
        if (this.isReducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
        } else {
            document.documentElement.style.setProperty('--animation-duration', '');
        }
    }

    // 更新对比度
    updateContrast() {
        if (this.isHighContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    // 向屏幕阅读器宣布消息
    announceToScreenReader(message) {
        if (this.srContainer) {
            this.srContainer.textContent = message;
            setTimeout(() => {
                this.srContainer.textContent = '';
            }, 1000);
        }
    }

    // 设置模态框
    setupModal(modal) {
        if (!modal) return;

        // 设置角色和属性
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', modal.id ? `${modal.id}-title` : 'modal-title');

        // 添加标题
        const title = document.createElement('h2');
        title.id = modal.id ? `${modal.id}-title` : 'modal-title';
        title.className = 'sr-only';
        title.textContent = '模态框';
        modal.insertBefore(title, modal.firstChild);

        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'modal-close';
        closeBtn.setAttribute('aria-label', '关闭');
        closeBtn.innerHTML = '&times;';

        closeBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.appendChild(closeBtn);
    }

    // 关闭模态框
    closeModal(modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        // 恢复焦点
        if (this.currentFocusableElement) {
            this.currentFocusableElement.focus();
        }

        this.announceToScreenReader('模态框已关闭');
    }

    // 打开模态框
    openModal(modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');

        // 保存当前焦点
        this.currentFocusableElement = document.activeElement;

        // 将焦点移动到模态框
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        this.announceToScreenReader('模态框已打开');
    }

    // 创建可访问的表格
    createAccessibleTable(data, headers) {
        const table = document.createElement('table');
        table.setAttribute('role', 'table');
        table.setAttribute('aria-label', '数据表格');

        // 创建表头
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.setAttribute('role', 'row');

        headers.forEach(header => {
            const th = document.createElement('th');
            th.setAttribute('role', 'columnheader');
            th.setAttribute('scope', 'col');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // 创建表体
        const tbody = document.createElement('tbody');
        tbody.setAttribute('role', 'rowgroup');

        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('role', 'row');

            headers.forEach(header => {
                const td = document.createElement('td');
                td.setAttribute('role', 'cell');
                td.textContent = row[header];
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        return table;
    }

    // 创建面包屑导航
    createBreadcrumbs(items) {
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', '面包屑导航');

        const ol = document.createElement('ol');
        ol.className = 'breadcrumbs';

        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'breadcrumb-item';

            if (index === items.length - 1) {
                // 当前页面
                const span = document.createElement('span');
                span.setAttribute('aria-current', 'page');
                span.textContent = item.text;
                li.appendChild(span);
            } else {
                // 链接
                const a = document.createElement('a');
                a.href = item.url;
                a.textContent = item.text;
                a.setAttribute('aria-label', `前往 ${item.text}`);
                li.appendChild(a);
            }

            ol.appendChild(li);

            // 添加分隔符
            if (index < items.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = '›';
                ol.appendChild(separator);
            }
        });

        nav.appendChild(ol);
        return nav;
    }

    // 创建进度指示器
    createProgressIndicator(value, max = 100) {
        const progress = document.createElement('div');
        progress.className = 'progress-indicator';
        progress.setAttribute('role', 'progressbar');
        progress.setAttribute('aria-valuenow', value);
        progress.setAttribute('aria-valuemin', '0');
        progress.setAttribute('aria-valuemax', max);
        progress.setAttribute('aria-label', `进度 ${value}%`);

        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.width = `${(value / max) * 100}%`;

        progress.appendChild(bar);
        return progress;
    }
}

// 创建全局无障碍管理器实例
export const accessibilityManager = new AccessibilityManager();