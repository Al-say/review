// typing.js - 打字机效果模块
export function initTypingEffect() {
    const texts = [
        '全栈开发工程师，热爱技术与创新。',
        '专注于构建优雅的 Web 应用。',
        '开源爱好者，分享即是学习。',
        '探索 AI 时代的无限可能。'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedElement = document.getElementById('typed-text');

    if (!typedElement) {
        console.warn('打字机效果：未找到 #typed-text 元素');
        return;
    }

    function typeEffect() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            typedElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 30 : 80;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000; // 停顿时间
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }

        setTimeout(typeEffect, typeSpeed);
    }

    // 启动打字机效果
    typeEffect();
}