'use strict';

// Cache DOM elements
const DOM = {
    mobileMenuBtn: document.querySelector('.mobile-menu-toggle'),
    navLinks: document.querySelector('.nav-links'),
    header: document.querySelector('header'),
    projectCards: document.querySelectorAll('.project-card'),
    cards: document.querySelectorAll('.card, .project-card')
};

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Smooth scroll functionality with performance optimization
function initSmoothScroll() {
    const scrollHandler = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollTo(0, offsetPosition);
        } else {
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Event delegation for smooth scroll
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
            scrollHandler(e);
        }
    });
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.innerHTML = '🌞';
    document.body.appendChild(themeToggle);

    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('darkMode');
    
    function setTheme(isDark) {
        document.documentElement.classList.toggle('dark-mode', isDark);
        themeToggle.innerHTML = isDark ? '🌙' : '🌞';
        localStorage.setItem('darkMode', isDark);
    }

    // Initialize theme
    if (savedTheme === 'true' || (savedTheme === null && prefersDarkScheme.matches)) {
        setTheme(true);
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTheme(!document.documentElement.classList.contains('dark-mode'));
    });

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
            setTheme(e.matches);
        }
    });
}

// Project cards interaction with performance optimization
function initProjectCards() {
    const projectsContainer = document.querySelector('.projects');
    if (!projectsContainer) return;

    const handleHover = (card, isEntering) => {
        requestAnimationFrame(() => {
            card.style.transform = isEntering ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)';
            card.style.boxShadow = isEntering ? '0 12px 20px rgba(0,0,0,0.15)' : 'none';
        });
    };

    // Event delegation for project cards
    projectsContainer.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.project-card');
        if (card) handleHover(card, true);
    });

    projectsContainer.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.project-card');
        if (card) handleHover(card, false);
    });

    projectsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => handleHover(card, true), 100);
        }
    });
}

// Scroll reveal animation with Intersection Observer
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    requestIdleCallback(() => {
        DOM.cards.forEach(element => {
            if (element.classList.contains('visible')) return;
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(element);
        });
    }, { timeout: 2000 });
}

// Mobile menu functionality with accessibility
function initMobileMenu() {
    function toggleMenu(show) {
        DOM.navLinks.classList.toggle('active', show);
        DOM.mobileMenuBtn.setAttribute('aria-expanded', show);
        DOM.mobileMenuBtn.innerHTML = show 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    }

    DOM.mobileMenuBtn?.addEventListener('click', () => {
        const willShow = !DOM.navLinks.classList.contains('active');
        toggleMenu(willShow);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (DOM.navLinks?.classList.contains('active') && !e.target.closest('nav')) {
            toggleMenu(false);
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.navLinks?.classList.contains('active')) {
            toggleMenu(false);
        }
    });
}

// Back to top functionality with performance optimization
function initBackToTop() {
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopButton.setAttribute('aria-label', '回到顶部');
    document.body.appendChild(backToTopButton);

    const toggleBackToTop = debounce(() => {
        const shouldShow = window.scrollY > 300;
        requestAnimationFrame(() => {
            backToTopButton.classList.toggle('visible', shouldShow);
        });
    }, 100);

    window.addEventListener('scroll', toggleBackToTop, { passive: true });

    backToTopButton.addEventListener('click', () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollTo(0, 0);
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

// Enhanced link hover effects with performance optimization
function initLinkEffects() {
    const handleHover = (link, isEntering) => {
        requestAnimationFrame(() => {
            link.style.color = isEntering ? 'var(--accent-color)' : 'var(--primary-color)';
            link.style.transform = isEntering ? 'translateX(5px)' : 'translateX(0)';
        });
    };

    // Event delegation for link hover effects
    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a:not(nav a)');
        if (link) {
            link.classList.add('will-change-transform');
            link.style.transition = 'all var(--transition-speed) ease';
            link.style.color = 'var(--primary-color)';
            handleHover(link, true);
        }
    });

    document.addEventListener('mouseout', (e) => {
        const link = e.target.closest('a:not(nav a)');
        if (link) handleHover(link, false);
    });
}

// Optimized scroll handlers with IntersectionObserver
function initParallaxEffect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const parallaxObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const handleScroll = debounce(() => {
                    requestAnimationFrame(() => {
                        entry.target.style.backgroundPositionY = `${window.pageYOffset * 0.5}px`;
                    });
                }, 10);
                
                window.addEventListener('scroll', handleScroll, { passive: true });
            }
        });
    });

    if (DOM.header) parallaxObserver.observe(DOM.header);
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Critical initialization
    initMobileMenu();
    initThemeToggle();
    
    // Defer non-critical initialization
    requestIdleCallback(() => {
        initSmoothScroll();
        initProjectCards();
        initScrollReveal();
        initBackToTop();
        initLinkEffects();
        initParallaxEffect();

        const style = document.createElement('style');
        style.textContent = `
            .visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }, { timeout: 2000 });
});

// Project cards loading animation with error handling
requestIdleCallback(() => {
    try {
        DOM.projectCards.forEach((card, index) => {
            if (card) {
                requestAnimationFrame(() => {
                    card.style.animationDelay = `${index * 0.2}s`;
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                });
            }
        });
    } catch (error) {
        console.error('Error initializing project cards:', error);
    }
}, { timeout: 2000 });

// Handle animation errors and cleanup
window.addEventListener('load', () => {
    try {
        DOM.projectCards.forEach(card => {
            if (card) {
                requestAnimationFrame(() => {
                    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }
        });
    } catch (error) {
        console.error('Error animating project cards:', error);
    }
});

// Cleanup on page unload
window.addEventListener('unload', () => {
    if (window.handleScroll) window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleKeyDown);
});
