// js/render/graph-view.js - 知识图谱视图
import { loadGraphData, loadSearchIndex } from '../data.js';
import { escapeHtml } from '../utils.js';

const CONFIG = {
    nodeRadius: 20,
    linkDistance: 120,
    repulsionForce: 800,
    centerForce: 0.05,
    damping: 0.85,
    iterations: 300
};

export class GraphRenderer {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.links = [];
        this.selectedNode = null;
        this.hoveredNode = null;
        this.isDragging = false;
        this.dragNode = null;
        this.transform = { x: 0, y: 0, scale: 1 };
        this.animationId = null;
        this.simulationStep = 0;
        this._handleResize = null;
    }

    async render() {
        this.container.innerHTML = `
            <div class="graph-container">
                <div class="graph-header">
                    <h2>知识图谱</h2>
                    <div class="graph-controls">
                        <button id="graph-reset" title="重置视图">⟲</button>
                        <button id="graph-fit" title="适应视图">⊡</button>
                    </div>
                </div>
                <div class="graph-loading">
                    <div class="loading-spinner"></div>
                    <div>正在加载知识图谱...</div>
                </div>
                <div class="graph-legend">
                    <span class="legend-item"><span class="legend-color" style="background: #2b59ff;"></span>主节点</span>
                    <span class="legend-item"><span class="legend-color" style="background: #7aa2ff;"></span>相关笔记</span>
                </div>
                <div id="graph-canvas-container">
                    <canvas id="graph-canvas"></canvas>
                </div>
                <div id="graph-tooltip" class="graph-tooltip"></div>
                <div id="graph-sidebar" class="graph-sidebar">
                    <div class="sidebar-header">
                        <h3 id="sidebar-title">选择节点</h3>
                        <button id="sidebar-close">×</button>
                    </div>
                    <div id="sidebar-content"></div>
                </div>
            </div>
        `;

        this.canvas = this.container.querySelector('#graph-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tooltip = this.container.querySelector('#graph-tooltip');
        this.sidebar = this.container.querySelector('#graph-sidebar');

        this.setupCanvas();

        // 移除加载状态
        const loadingElement = this.container.querySelector('.graph-loading');
        if (loadingElement) {
            loadingElement.remove();
        }

        await this.loadData();
        this.startSimulation();
        this.bindEvents();
        this.renderLoop();
    }

    setupCanvas() {
        const container = this.container.querySelector('#graph-canvas-container');
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // 重置 transform 后再设置 scale，避免累积
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;
    }

    async loadData() {
        try {
            const graphData = await loadGraphData();
            const indexData = await loadSearchIndex();

            // 合并数据
            this.nodes = graphData.nodes.map(node => ({
                ...node,
                x: Math.random() * this.width - this.width / 2,
                y: Math.random() * this.height - this.height / 2,
                vx: 0,
                vy: 0
            }));

            const linkData = graphData.links || graphData.edges || [];
            this.links = linkData.map(link => {
                const source = this.nodes.find(n => n.id === link.source);
                const target = this.nodes.find(n => n.id === link.target);
                return { ...link, source, target };
            }).filter(l => l.source && l.target);

        } catch (error) {
            console.error('加载图谱数据失败:', error);
            this.nodes = [];
            this.links = [];
        }
    }

    startSimulation() {
        this.simulationStep = 0;
        this.updateForces();
    }

    updateForces() {
        if (this.simulationStep >= CONFIG.iterations) return;

        // 计算力
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            let fx = 0, fy = 0;

            // 排斥力
            for (let j = 0; j < this.nodes.length; j++) {
                if (i === j) continue;
                const other = this.nodes[j];
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = CONFIG.repulsionForce / (dist * dist);
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
            }

            // 中心引力
            fx -= node.x * CONFIG.centerForce;
            fy -= node.y * CONFIG.centerForce;

            // 弹簧力（链接）
            const connectedLinks = this.links.filter(l => l.source === node || l.target === node);
            connectedLinks.forEach(link => {
                const other = link.source === node ? link.target : link.source;
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (dist - CONFIG.linkDistance) * 0.01;
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
            });

            node.vx = (node.vx + fx) * CONFIG.damping;
            node.vy = (node.vy + fy) * CONFIG.damping;

            // 速度限制
            const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
            const maxSpeed = 10;
            if (speed > maxSpeed) {
                node.vx = (node.vx / speed) * maxSpeed;
                node.vy = (node.vy / speed) * maxSpeed;
            }
        }

        // 更新位置
        this.nodes.forEach(node => {
            if (node !== this.dragNode) {
                node.x += node.vx;
                node.y += node.vy;
            }
        });

        this.simulationStep++;
    }

    renderLoop() {
        const render = () => {
            this.updateForces();
            this.draw();
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(this.transform.scale, this.transform.scale);
        this.ctx.translate(this.transform.x, this.transform.y);

        // 绘制链接
        this.ctx.strokeStyle = '#e1e5e9';
        this.ctx.lineWidth = 1;
        this.links.forEach(link => {
            this.ctx.beginPath();
            this.ctx.moveTo(link.source.x, link.source.y);
            this.ctx.lineTo(link.target.x, link.target.y);
            this.ctx.stroke();
        });

        // 绘制节点
        this.nodes.forEach(node => {
            const isSelected = node === this.selectedNode;
            const isHovered = node === this.hoveredNode;
            const radius = isSelected ? CONFIG.nodeRadius * 1.5 :
                           isHovered ? CONFIG.nodeRadius * 1.2 : CONFIG.nodeRadius;

            // 节点背景
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#2b59ff';
            this.ctx.fill();

            // 选中/悬停效果
            if (isSelected || isHovered) {
                this.ctx.strokeStyle = '#7aa2ff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }

            // 节点文字（截断）
            this.ctx.fillStyle = '#1b1e28';
            this.ctx.font = '12px -apple-system, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const label = node.title.length > 10 ? node.title.slice(0, 10) + '...' : node.title;
            this.ctx.fillText(label, node.x, node.y);
        });

        this.ctx.restore();
    }

    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

        // 触摸事件 - 使用 passive: false 以允许 preventDefault()
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.onMouseUp());

        // 按钮事件
        this.container.querySelector('#graph-reset').addEventListener('click', () => this.resetView());
        this.container.querySelector('#graph-fit').addEventListener('click', () => this.fitView());
        this.container.querySelector('#sidebar-close').addEventListener('click', () => this.closeSidebar());

        // 窗口调整
        this._handleResize = () => this.setupCanvas();
        window.addEventListener('resize', this._handleResize);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.transform.scale;
        const x = (e.clientX - rect.left - this.width / 2) / scale - this.transform.x;
        const y = (e.clientY - rect.top - this.height / 2) / scale - this.transform.y;
        return { x, y };
    }

    getNodeAtPos(pos) {
        return this.nodes.find(node => {
            const dx = node.x - pos.x;
            const dy = node.y - pos.y;
            return Math.sqrt(dx * dx + dy * dy) < CONFIG.nodeRadius;
        });
    }

    onMouseDown(e) {
        const pos = this.getMousePos(e);
        const node = this.getNodeAtPos(pos);
        if (node) {
            this.isDragging = true;
            this.dragNode = node;
        }
    }

    onMouseMove(e) {
        const pos = this.getMousePos(e);

        if (this.isDragging && this.dragNode) {
            this.dragNode.x = pos.x;
            this.dragNode.y = pos.y;
        } else {
            const node = this.getNodeAtPos(pos);
            this.hoveredNode = node;
            this.canvas.style.cursor = node ? 'pointer' : 'default';

            // 更新提示
            if (node) {
                this.tooltip.textContent = node.title;
                this.tooltip.style.display = 'block';
                this.tooltip.style.left = (e.clientX + 10) + 'px';
                this.tooltip.style.top = (e.clientY + 10) + 'px';
            } else {
                this.tooltip.style.display = 'none';
            }
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.dragNode = null;
    }

    onClick(e) {
        const pos = this.getMousePos(e);
        const node = this.getNodeAtPos(pos);
        if (node) {
            this.selectNode(node);
        }
    }

    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.transform.scale *= delta;
        this.transform.scale = Math.max(0.1, Math.min(5, this.transform.scale));
    }

    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }

    onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }

    selectNode(node) {
        this.selectedNode = node;

        // 显示侧边栏
        const sidebarContent = this.container.querySelector('#sidebar-content');
        const sidebarTitle = this.container.querySelector('#sidebar-title');
        sidebarTitle.textContent = node.title;

        const linkedNotes = this.links
            .filter(l => l.source === node || l.target === node)
            .map(l => l.source === node ? l.target : l.source);

        sidebarContent.innerHTML = `
            <div class="sidebar-info">
                <p><strong>主题:</strong> ${escapeHtml(node.topic || '未分类')}</p>
                <p><strong>标签:</strong> ${(node.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</p>
                <p><strong>连接数:</strong> ${linkedNotes.length}</p>
            </div>
            <div class="sidebar-links">
                <h4>关联笔记</h4>
                <ul>
                    ${linkedNotes.map(n => `<li><a href="#/note/${n.id}">${escapeHtml(n.title)}</a></li>`).join('')}
                </ul>
            </div>
            <a href="#/note/${node.id}" class="view-note-btn">查看笔记</a>
        `;

        this.sidebar.classList.add('open');
    }

    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.selectedNode = null;
    }

    resetView() {
        this.transform = { x: 0, y: 0, scale: 1 };
        this.startSimulation();
    }

    fitView() {
        if (this.nodes.length === 0) return;

        const padding = 50;
        const xs = this.nodes.map(n => n.x);
        const ys = this.nodes.map(n => n.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);

        const contentWidth = maxX - minX + padding * 2;
        const contentHeight = maxY - minY + padding * 2;

        this.transform.scale = Math.min(
            this.width / contentWidth,
            this.height / contentHeight,
            2
        );

        this.transform.x = -(minX + maxX) / 2 * this.transform.scale;
        this.transform.y = -(minY + maxY) / 2 * this.transform.scale;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this._handleResize) {
            window.removeEventListener('resize', this._handleResize);
            this._handleResize = null;
        }
    }
}
