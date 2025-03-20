// 导航控制
class Navigation {
    constructor() {
        this.nav = document.querySelector('nav');
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.lastScroll = 0;
        this.isMenuOpen = false;

        this.init();
    }

    init() {
        this.handleMobileMenu();
        this.handleScroll();
        this.handleNavLinks();
    }

    handleMobileMenu() {
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', () => {
                this.isMenuOpen = !this.isMenuOpen;
                this.navLinks.classList.toggle('active');
                this.mobileMenuToggle.setAttribute('aria-expanded', this.isMenuOpen);
                document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
            });
        }
    }

    handleScroll() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateNavigation();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateNavigation() {
        const currentScroll = window.pageYOffset;
        
        // 如果在顶部，移除所有类
        if (currentScroll <= 0) {
            this.nav.classList.remove('scroll-up', 'scroll-down');
            return;
        }

        // 向下滚动
        if (currentScroll > this.lastScroll && !this.nav.classList.contains('scroll-down')) {
            this.nav.classList.remove('scroll-up');
            this.nav.classList.add('scroll-down');
            // 如果菜单打开，关闭它
            if (this.isMenuOpen) {
                this.closeMenu();
            }
        }
        // 向上滚动
        else if (currentScroll < this.lastScroll && this.nav.classList.contains('scroll-down')) {
            this.nav.classList.remove('scroll-down');
            this.nav.classList.add('scroll-up');
        }

        this.lastScroll = currentScroll;
    }

    handleNavLinks() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMenu();
                
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    const headerOffset = 60;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.navLinks.classList.remove('active');
        this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// 滚动动画
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.handleParallax();
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    handleParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    parallaxElements.forEach(element => {
                        const speed = element.dataset.speed || 0.5;
                        const yPos = -(scrolled * speed);
                        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}

// 暗色模式处理
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.handleThemeTransition();
    }

    handleThemeTransition() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addListener(() => {
            document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease');
            setTimeout(() => {
                document.documentElement.style.removeProperty('--theme-transition');
            }, 300);
        });
    }
}

// 页面加载优化
class PageLoader {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            this.hideLoader();
        });
    }

    hideLoader() {
        const loader = document.querySelector('.initial-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
    new ScrollAnimations();
    new ThemeManager();
    new PageLoader();
});
