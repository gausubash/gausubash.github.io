// Create floating particles with tech theme
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Add binary numbers or tech symbols occasionally
    if (Math.random() < 0.1) {
        particle.textContent = Math.random() < 0.5 ? '1' : '0';
        particle.style.color = '#00ffff';
        particle.style.fontFamily = 'monospace';
        particle.style.fontSize = '12px';
        particle.style.background = 'transparent';
        particle.style.display = 'flex';
        particle.style.alignItems = 'center';
        particle.style.justifyContent = 'center';
    }
    
    const size = Math.random() * 6 + 4;
    const duration = Math.random() * 3 + 3;
    const delay = Math.random() * 2;
    
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = delay + 's';
    
    document.querySelector('.bg-animation').appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, (duration + delay) * 1000);
}

// Create particles periodically
setInterval(createParticle, 300);

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.section-title, .portfolio-item, .skill-item, .hobbie-item').forEach(el => {
    observer.observe(el);
});

// Staggered animation for portfolio items
const portfolioItems = document.querySelectorAll('.portfolio-item');
portfolioItems.forEach((item, index) => {
    item.style.animationDelay = (index * 0.1) + 's';
});

// Staggered animation for skill items
const skillItems = document.querySelectorAll('.skill-item');
skillItems.forEach((item, index) => {
    item.style.animationDelay = (index * 0.1) + 's';
});

// Staggered animation for hobbies items
const hobbieItems = document.querySelectorAll('.hobbie-item');
hobbieItems.forEach((item, index) => {
    item.style.animationDelay = (index * 0.1) + 's';
});

// Add some interactive particle effects on mouse move
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Occasionally create a particle at mouse position
    if (Math.random() < 0.02) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'fixed';
        particle.style.left = mouseX + 'px';
        particle.style.top = mouseY + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '999';
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
});

// // Add parallax effect to hero section
// window.addEventListener('scroll', () => {
//     const scrolled = window.pageYOffset;
//     const hero = document.querySelector('.hero');
//     if (hero) {
//         hero.style.transform = `translateY(${scrolled * 0.5}px)`;
//     }
// });

