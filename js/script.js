// Cache DOM elements
const DOM = {
    weatherWidget: document.querySelector('.weather-widget'),
    weatherCity: document.querySelector('.weather-widget .weather-city'),
    weatherTemp: document.querySelector('.weather-widget .weather-temp'),
    weatherDesc: document.querySelector('.weather-widget .weather-desc'),
    weatherIcon: document.querySelector('.weather-widget i'),
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

// Weather widget functionality with JSONP
function updateWeather() {
    const API_KEY = 'YOUR_API_KEY'; // 替换为你的OpenWeatherMap API Key
    const CITY_LAT = 31.6733; // 马鞍山纬度
    const CITY_LON = 118.5070; // 马鞍山经度

    // 创建script标签加载JSONP
    const script = document.createElement('script');
    script.src = `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${API_KEY}&units=metric&lang=zh_cn&callback=handleWeatherData`;
    document.body.appendChild(script);

    // 移除script标签
    script.onload = function() {
        document.body.removeChild(script);
    };
}

// JSONP回调函数
window.handleWeatherData = function(data) {
    try {

        // 天气状况映射
        const weatherIconMap = {
            '01d': 'sun', // 晴天
            '01n': 'moon',
            '02d': 'cloud-sun', // 少云
            '02n': 'cloud-moon',
            '03d': 'cloud', // 多云
            '03n': 'cloud',
            '04d': 'cloud', // 阴天
            '04n': 'cloud',
            '09d': 'cloud-rain', // 小雨
            '09n': 'cloud-rain',
            '10d': 'cloud-showers-heavy', // 大雨
            '10n': 'cloud-showers-heavy',
            '11d': 'bolt', // 雷雨
            '11n': 'bolt',
            '13d': 'snowflake', // 雪
            '13n': 'snowflake',
            '50d': 'smog', // 雾
            '50n': 'smog'
        };

        const iconCode = data.weather[0].icon;
        const iconName = weatherIconMap[iconCode] || 'cloud';

        // 更新DOM元素
        DOM.weatherCity.textContent = '马鞍山';
        DOM.weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
        DOM.weatherDesc.textContent = `${data.weather[0].description}，湿度${data.main.humidity}%`;
        DOM.weatherIcon.className = `fas fa-${iconName}`;

        // 添加accessibility标题
        DOM.weatherWidget.title = `当前天气：${data.weather[0].description}，温度${Math.round(data.main.temp)}°C，湿度${data.main.humidity}%`;
    } catch (error) {
        console.error('天气数据处理失败:', error);
        handleWeatherError();
    }
};

// 错误处理函数
function handleWeatherError() {
    DOM.weatherCity.textContent = '马鞍山';
    DOM.weatherTemp.textContent = 'N/A';
    DOM.weatherDesc.textContent = '天气数据获取失败';
    DOM.weatherIcon.className = 'fas fa-cloud';
}

// 超时处理
window.setTimeout(() => {
    if (!window.handleWeatherData.called) {
        handleWeatherError();
    }
}, 5000);

// 初始化天气，并每30分钟更新一次
updateWeather();
const weatherInterval = setInterval(updateWeather, 30 * 60 * 1000);

// 标记是否已调用回调
window.handleWeatherData.called = false;
window.handleWeatherData.original = window.handleWeatherData;
window.handleWeatherData = function(data) {
    window.handleWeatherData.called = true;
    window.handleWeatherData.original(data);
};

// 页面卸载时清理
window.addEventListener('unload', () => {
    clearInterval(weatherInterval);
    delete window.handleWeatherData;
});

// Smooth scroll functionality with performance optimization
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
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
        });
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
        document.body.classList.toggle('dark-mode', isDark);
        themeToggle.innerHTML = isDark ? '🌙' : '🌞';
        localStorage.setItem('darkMode', isDark);
    }

    // Initialize theme
    if (savedTheme === 'true' || (savedTheme === null && prefersDarkScheme.matches)) {
        setTheme(true);
    }

    themeToggle.addEventListener('click', () => {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTheme(!document.body.classList.contains('dark-mode'));
    });

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
            setTheme(e.matches);
        }
    });
}

// Project cards interaction
function initProjectCards() {
    DOM.projectCards.forEach(card => {
        const handleHover = (isEntering) => {
            requestAnimationFrame(() => {
                card.style.transform = isEntering ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)';
                card.style.boxShadow = isEntering ? '0 12px 20px rgba(0,0,0,0.15)' : 'none';
            });
        };

        card.addEventListener('mouseenter', () => handleHover(true));
        card.addEventListener('mouseleave', () => handleHover(false));
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => handleHover(true), 100);
        });
    });
}

// Scroll reveal animation
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

    DOM.cards.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
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

    DOM.mobileMenuBtn.addEventListener('click', () => {
        const willShow = !DOM.navLinks.classList.contains('active');
        toggleMenu(willShow);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && DOM.navLinks.classList.contains('active')) {
            toggleMenu(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.navLinks.classList.contains('active')) {
            toggleMenu(false);
        }
    });
}

// Back to top functionality with performance optimization
function initBackToTop() {
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.setAttribute('aria-label', '回到顶部');
    document.body.appendChild(backToTopButton);

    const toggleBackToTop = debounce(() => {
        backToTopButton.classList.toggle('visible', window.scrollY > 300);
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
    document.querySelectorAll('a').forEach(link => {
        if (!link.closest('nav')) {
            link.classList.add('will-change-transform');
            link.style.transition = 'all var(--transition-speed) ease';
            link.style.color = 'var(--primary-color)';
            
            const handleHover = (isEntering) => {
                requestAnimationFrame(() => {
                    link.style.color = isEntering ? 'var(--accent-color)' : 'var(--primary-color)';
                    link.style.transform = isEntering ? 'translateX(5px)' : 'translateX(0)';
                });
            };

            link.addEventListener('mouseenter', () => handleHover(true));
            link.addEventListener('mouseleave', () => handleHover(false));
        }
    });
}

// Optimized scroll handlers
function initParallaxEffect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleScroll = debounce(() => {
        requestAnimationFrame(() => {
            DOM.header.style.backgroundPositionY = `${window.pageYOffset * 0.5}px`;
        });
    }, 10);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initThemeToggle();
    initProjectCards();
    initScrollReveal();
    initMobileMenu();
    initBackToTop();
    initLinkEffects();
    initParallaxEffect();

    // Add visible class for animation
    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
});

// Project cards loading animation
document.addEventListener('DOMLoaded', () => {
    DOM.projectCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
    });
});

window.addEventListener('load', () => {
    DOM.projectCards.forEach(card => {
        requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    });
});
