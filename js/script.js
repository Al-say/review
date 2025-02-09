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

// Add hover effect for links
document.querySelectorAll('a').forEach(link => {
    if (!link.closest('nav')) { // Exclude nav links as they have their own styling
        link.style.transition = 'color 0.3s ease';
        link.style.color = 'var(--primary-color)';
        link.addEventListener('mouseenter', () => {
            link.style.color = 'var(--accent-color)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.color = 'var(--primary-color)';
        });
    }
});
