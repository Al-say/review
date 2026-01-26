// js/ui/shortcuts-panel.js - 快捷键帮助面板
export class ShortcutsPanel {
    constructor() {
        this.isOpen = false;
        this.panel = null;

        this.init();
    }

    init() {
        this.createPanel();
        this.bindEvents();
    }

    createPanel() {
        const panelHTML = `
            <div id="shortcuts-panel" class="shortcuts-panel" style="display: none;">
                <div class="shortcuts-overlay"></div>
                <div class="shortcuts-container">
                    <div class="shortcuts-header">
                        <h2>键盘快捷键</h2>
                        <button class="shortcuts-close">&times;</button>
                    </div>
                    <div class="shortcuts-content">
                        <div class="shortcuts-section">
                            <h3>导航</h3>
                            <div class="shortcuts-list">
                                <div class="shortcut-item">
                                    <kbd>/</kbd>
                                    <span>打开搜索</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Esc</kbd>
                                    <span>关闭面板/弹窗</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>?</kbd>
                                    <span>显示快捷键帮助</span>
                                </div>
                            </div>
                        </div>
                        <div class="shortcuts-section">
                            <h3>搜索面板</h3>
                            <div class="shortcuts-list">
                                <div class="shortcut-item">
                                    <kbd>↑</kbd><kbd>↓</kbd>
                                    <span>选择结果</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Enter</kbd>
                                    <span>打开选中项</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Esc</kbd>
                                    <span>关闭搜索</span>
                                </div>
                            </div>
                        </div>
                        <div class="shortcuts-section">
                            <h3>笔记阅读</h3>
                            <div class="shortcuts-list">
                                <div class="shortcut-item">
                                    <kbd>←</kbd><kbd>→</kbd>
                                    <span>切换笔记</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>A+</kbd><kbd>A-</kbd>
                                    <span>调整字体大小</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>g</kbd>
                                    <span>查看知识图谱</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>t</kbd>
                                    <span>查看时间线</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="shortcuts-footer">
                        <p>按 <kbd>Esc</kbd> 或点击外部区域关闭</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
        this.panel = document.getElementById('shortcuts-panel');
        this.overlay = this.panel.querySelector('.shortcuts-overlay');
    }

    bindEvents() {
        // 关闭按钮
        this.panel.querySelector('.shortcuts-close').addEventListener('click', () => {
            this.close();
        });

        // 点击遮罩关闭
        this.overlay.addEventListener('click', () => {
            this.close();
        });

        // 全局快捷键绑定
        document.addEventListener('keydown', (e) => {
            // ? 键打开帮助（除了在输入框中）
            if (e.key === '?' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.toggle();
            }

            // Esc 键关闭
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.panel.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        this.panel.style.display = 'none';
        document.body.style.overflow = '';
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }
}
