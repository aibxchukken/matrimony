document.addEventListener('DOMContentLoaded', () => {
    
    // --- THREE.JS BACKGROUND ---
    const initThreeJS = () => {
        const canvas = document.getElementById('bg-canvas');
        if(!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 400;
        const posArray = new Float32Array(particlesCount * 3);

        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x0a5c36,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);

        camera.position.z = 3;

        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.y += 0.0005;
            particlesMesh.rotation.x += 0.0002;
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
    initThreeJS();

    // --- MOBILE NAV TOGGLE & CLOSING LOGIC ---
const hamburger = document.querySelector('.hamburger') || document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a'); // Select all links

// Toggle menu on hamburger click
hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('is-active');
});

// Close menu when any link is clicked
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger?.classList.remove('is-active');
    });
});

    // --- SCROLL REVEAL ANIMATIONS ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            
            if(entry.target.classList.contains('metric-card')) {
                const counter = entry.target.querySelector('.counter');
                if(counter && !counter.classList.contains('counted')) {
                    runCounter(counter);
                    counter.classList.add('counted');
                }
            }
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // --- ADMIN & METRICS LOGIC ---
    const loadMetrics = () => {
        const savedMetrics = JSON.parse(localStorage.getItem('ishq_metrics'));
        if (savedMetrics) {
            const el1 = document.querySelector('[data-target="2025"]');
            const el2 = document.querySelector('[data-target="1500"]');
            const el3 = document.querySelector('[data-target="500"]');
            
            if(el1) el1.setAttribute('data-target', savedMetrics.est || 2025);
            if(el2) el2.setAttribute('data-target', savedMetrics.trusted || 1500);
            if(el3) el3.setAttribute('data-target', savedMetrics.guidance || 500);
            
            if(document.getElementById('admin-est')) document.getElementById('admin-est').value = savedMetrics.est || 2025;
            if(document.getElementById('admin-trusted')) document.getElementById('admin-trusted').value = savedMetrics.trusted || 1500;
            if(document.getElementById('admin-guidance')) document.getElementById('admin-guidance').value = savedMetrics.guidance || 500;
        }
    };
    loadMetrics();

    const runCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target + suffix;
            }
        };
        updateCounter();
    };

    // --- MODAL & FORM LOGIC ---
    window.openModal = (id) => {
        const modal = document.getElementById(id);
        if(!modal) return;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = (id) => {
        const modal = document.getElementById(id);
        if(!modal) return;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    };

    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    };

    window.handleRegistration = (e, type) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        let message = `*New ${type} Registration - ISHQ MATRIMONY*%0A%0A`;
        
        for (let [key, value] of formData.entries()) {
            if(value.trim() !== '') {
                if(key === 'PrefDistrict') message += `%0A*--- Partner Preferences ---*%0A`;
                const readableKey = key.replace(/([A-Z])/g, ' $1').trim();
                message += `*${readableKey}:* ${value}%0A`;
            }
        }
        
        const whatsappURL = `https://wa.me/917012297882?text=${message}`;
        window.open(whatsappURL, '_blank');
        form.reset();
        closeModal(form.closest('.modal').id);
    };

    // --- SMOOTH SCROLLING ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- ADMIN DRAWER LOGIC ---
window.handleAdminUpdate = () => {
    const email = document.getElementById('adminEmailInput')?.value;
    const metricType = document.getElementById('metricSelectorField')?.value;
    const newValue = document.getElementById('metricNewValueInput')?.value;
    const consoleEl = document.getElementById('adminMessageConsole');

    const authorizedEmails = ['kmcshibu3@gmail.com', 'ishqmatrimony@gmail.com'];

    if (!authorizedEmails.includes(email?.toLowerCase())) {
        consoleEl.innerText = "Access Denied: Unauthorized email address.";
        consoleEl.style.color = "red";
        return;
    }

    // Update localStorage
    let metrics = JSON.parse(localStorage.getItem('ishq_metrics')) || { est: 2025, trusted: 1500, guidance: 500 };
    metrics[metricType] = newValue;
    localStorage.setItem('ishq_metrics', JSON.stringify(metrics));

    // --- NEW: Update DOM directly without refresh ---
    // Find the counter element by matching the data-target or context
    // This assumes your HTML elements have a class or ID identifying them
    const targetElement = document.querySelector(`[data-metric-type="${metricType}"]`);
    if (targetElement) {
        targetElement.innerText = newValue + "+"; 
    }

    consoleEl.innerText = "Success: Metric updated on page.";
    consoleEl.style.color = "green";
};

    document.getElementById('adminPanelToggleBtn')?.addEventListener('click', () => {
        document.getElementById('adminControlDrawer')?.classList.toggle('hidden');
    });

    document.getElementById('executeMetricUpdateBtn')?.addEventListener('click', window.handleAdminUpdate);
});
