// Weather widget functionality using MCP weather server
async function updateWeather() {
    try {
        const weatherWidget = document.querySelector('.weather-widget');
        const cityElement = weatherWidget.querySelector('.weather-city');
        const tempElement = weatherWidget.querySelector('.weather-temp');
        const descElement = weatherWidget.querySelector('.weather-desc');
        const weatherIcon = weatherWidget.querySelector('i');

        const response = await fetch('js/weather-data.json');
        const weatherData = await response.json();
        
        // Update weather icon based on conditions
        const weatherIconMap = {
            'clear': 'sun',
            'overcast clouds': 'cloud',
            'scattered clouds': 'cloud',
            'broken clouds': 'cloud',
            'rain': 'cloud-rain',
            'snow': 'snowflake',
            'thunderstorm': 'bolt',
            'drizzle': 'cloud-rain',
            'mist': 'smog'
        };

        // Update weather information
        cityElement.textContent = '北京';
        tempElement.textContent = `${Math.round(weatherData.temperature)}°C`;
        const weatherText = `${weatherData.conditions}，湿度${weatherData.humidity}%`;
        descElement.textContent = weatherText;
        
        // Update icon based on conditions
        const iconName = weatherData.conditions.includes('云') ? 'cloud' : 'sun';
        weatherIcon.className = `fas fa-${iconName}`;
    } catch (error) {
        console.error('天气获取失败:', error);
    }
}

// Initialize weather and update every 5 minutes
updateWeather();
setInterval(updateWeather, 300000);

// Smooth scroll functionality with improved easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Theme toggle functionality with improved animation and persistence
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.setAttribute('aria-label', 'Toggle dark mode');
themeToggle.innerHTML = '🌞';
document.body.appendChild(themeToggle);

// Check system preference for dark mode
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Initialize theme based on localStorage or system preference
const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true' || (savedTheme === null && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    document.body.classList.toggle('dark-mode');
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '🌙' : '🌞';
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Enhanced project cards interaction
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
        this.style.boxShadow = '0 12px 20px rgba(0,0,0,0.15)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = 'none';
    });

    card.addEventListener('click', function() {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        }, 100);
    });
});

// Scroll reveal animation with intersection observer
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add initial styles and observe elements
document.querySelectorAll('.card, .project-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(element);
});

// Add visible class for animation
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
});

// Add parallax effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const scrolled = window.pageYOffset;
    header.style.backgroundPositionY = scrolled * 0.5 + 'px';
});

// Mobile menu functionality
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuToggle.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('nav') && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// Back to top functionality
const backToTopButton = document.createElement('button');
backToTopButton.className = 'back-to-top';
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
document.body.appendChild(backToTopButton);

const toggleBackToTop = () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
};

window.addEventListener('scroll', toggleBackToTop);

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Enhanced link hover effects
document.querySelectorAll('a').forEach(link => {
    if (!link.closest('nav')) {
        link.style.transition = 'all var(--transition-speed) ease';
        link.style.color = 'var(--primary-color)';
        
        link.addEventListener('mouseenter', () => {
            link.style.color = 'var(--accent-color)';
            link.style.transform = 'translateX(5px)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.color = 'var(--primary-color)';
            link.style.transform = 'translateX(0)';
        });
    }
});

// Add loading animation for project cards
document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
});

// Trigger loading animation after page load
window.addEventListener('load', () => {
    document.querySelectorAll('.project-card').forEach(card => {
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
});
