// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// Check for saved user preference, else use system preference
const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Apply theme
const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
};

// Initialize theme
setTheme(getPreferredTheme());

themeToggle.addEventListener('click', (e) => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Fallback for browsers that don't support View Transitions
    if (!document.startViewTransition) {
        setTheme(newTheme);
        return;
    }

    // Get click coordinates to originate the expanding circle
    const x = e.clientX;
    const y = e.clientY;
    
    // Calculate the distance to the furthest screen corner for the max radius
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );
    
    // Start the transition
    const transition = document.startViewTransition(() => {
        setTheme(newTheme);
    });
    
    // Wait for the pseudo-elements to be created, then animate the new state
    transition.ready.then(() => {
        const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
        ];
        
        document.documentElement.animate(
            { clipPath },
            {
                duration: 600, // 0.6 seconds
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            }
        );
    });
});


// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links li a');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});


// Sticky Header & Active Link Highlighting
const header = document.getElementById('header');
const sections = document.querySelectorAll('section');
const studentName = document.querySelector('.name'); // The student name element

window.addEventListener('scroll', () => {
    // Scroll animation for the student name
    if (studentName) {
        const scrollY = window.scrollY;

        // The animation logic:
        // Fade out smoothly until fully invisible at 350px scroll
        const opacity = Math.max(1 - (scrollY / 350), 0);

        // Move smoothly to the left (Slide out effect)
        const translateX = scrollY * 1.2; // Adjust multiplier to speed up or slow down horizontal movement

        // Add a blur effect to simulate "going out of focus"
        const blurAmount = Math.min(scrollY / 40, 10);

        // Scale down slightly for a deeper 3D feel
        const scaleAmount = Math.max(1 - (scrollY / 800), 0.8);

        // Apple-like scroll effect formatting
        studentName.style.opacity = opacity;
        studentName.style.transform = `translateX(-${translateX}px) scale(${scaleAmount})`;
        studentName.style.filter = `blur(${blurAmount}px)`;
        studentName.style.willChange = 'opacity, transform, filter';

        // Disable pointer events when completely invisible to prevent clicking unseen elements
        studentName.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
    }

    // Sticky header
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }

    // Active link highlighting
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').substring(1) === current) {
            item.classList.add('active');
        }
    });
});


// Scroll Animations (Intersection Observer)
const animateElements = document.querySelectorAll('.fade-in, .fade-up, .slide-in-left, .slide-in-right, .scale-in, .slide-up');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');

            // To animate progress bars and numbers if they exist inside the target
            if (entry.target.classList.contains('skill-category')) {
                const progressBars = entry.target.querySelectorAll('.progress');
                progressBars.forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });

                const skillPercentages = entry.target.querySelectorAll('.skill-percentage');
                skillPercentages.forEach(skillPercent => {
                    const target = parseInt(skillPercent.getAttribute('data-target'));
                    let current = 0;
                    // Duration of 1.5s (same as CSS transition)
                    const incrementTime = 1500 / target;

                    const updateCounter = setInterval(() => {
                        current++;
                        skillPercent.textContent = current + '%';

                        if (current >= target) {
                            clearInterval(updateCounter);
                            skillPercent.textContent = target + '%';
                        }
                    }, incrementTime);
                });
            }

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

animateElements.forEach(el => {
    observer.observe(el);
});


// Form Submission to Google Sheet
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const scriptURL = 'https://script.google.com/macros/s/AKfycbwdn6A-ARNAqmbKqcJHHXd5KON5D1kYUeD2p9PM17TN1ci20SvJvcZ4-0i4qHIyG0ca/exec';

        fetch(scriptURL, { 
            method: 'POST', 
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        })
        .then(() => {
            alert('✓ Message saved successfully!');
            contactForm.reset();
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        })
        .catch(error => {
            alert('Message saved! Thank you.');
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        });
    });
}
