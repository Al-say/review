// js/utils/touch-gestures.js - 触摸手势支持
export class TouchGestures {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            swipeThreshold: 50,
            longPressDelay: 500,
            doubleTapDelay: 300,
            ...options
        };

        this.reset();
        this.init();
    }

    reset() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.lastTapTime = 0;
        this.longPressTimer = null;
        this.isLongPress = false;
        this.hasMoved = false;
    }

    init() {
        // 触摸开始
        this.element.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });

        // 触摸移动
        this.element.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });

        // 触摸结束
        this.element.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // 触摸取消
        this.element.addEventListener('touchcancel', () => this.handleTouchCancel());
    }

    handleTouchStart(e) {
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartTime = Date.now();
        this.hasMoved = false;
        this.isLongPress = false;

        // 检查双击
        const currentTime = Date.now();
        if (currentTime - this.lastTapTime < this.options.doubleTapDelay) {
            this.emit('doubletap', e);
            this.lastTapTime = 0;
            return;
        }
        this.lastTapTime = currentTime;

        // 长按检测
        this.longPressTimer = setTimeout(() => {
            this.isLongPress = true;
            this.emit('longpress', e);
        }, this.options.longPressDelay);
    }

    handleTouchMove(e) {
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 如果移动距离超过阈值，认为是滑动手势
        if (distance > this.options.swipeThreshold) {
            this.hasMoved = true;
            clearTimeout(this.longPressTimer);

            // 计算滑动方向
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

            // 判断滑动方向
            if (angle >= -45 && angle < 45) {
                this.emit('swipe', { ...e, direction: 'right' });
            } else if (angle >= 45 && angle < 135) {
                this.emit('swipe', { ...e, direction: 'down' });
            } else if (angle >= 135 || angle < -135) {
                this.emit('swipe', { ...e, direction: 'left' });
            } else {
                this.emit('swipe', { ...e, direction: 'up' });
            }
        }
    }

    handleTouchEnd(e) {
        clearTimeout(this.longPressTimer);

        if (!this.hasMoved && !this.isLongPress) {
            // 单击
            this.emit('tap', e);
        }

        this.reset();
    }

    handleTouchCancel() {
        clearTimeout(this.longPressTimer);
        this.reset();
    }

    emit(event, data) {
        // 创建自定义事件
        const customEvent = new CustomEvent(`gesture-${event}`, {
            bubbles: true,
            cancelable: true,
            detail: data
        });

        this.element.dispatchEvent(customEvent);
    }

    destroy() {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
        this.element.removeEventListener('touchcancel', this.handleTouchCancel);
        clearTimeout(this.longPressTimer);
    }
}

// 全局手势管理器
export class GestureManager {
    constructor() {
        this.gestures = new Map();
    }

    // 为元素添加手势支持
    add(element, options = {}) {
        if (!this.gestures.has(element)) {
            const gesture = new TouchGestures(element, options);
            this.gestures.set(element, gesture);
            return gesture;
        }
        return this.gestures.get(element);
    }

    // 移除元素的手势支持
    remove(element) {
        const gesture = this.gestures.get(element);
        if (gesture) {
            gesture.destroy();
            this.gestures.delete(element);
        }
    }

    // 清理所有手势
    clear() {
        this.gestures.forEach(gesture => gesture.destroy());
        this.gestures.clear();
    }
}

// 创建全局手势管理器实例
export const gestureManager = new GestureManager();