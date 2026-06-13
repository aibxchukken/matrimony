document.addEventListener('DOMContentLoaded', () => {
    
    // --- THREE.JS BACKGROUND (Subtle Particles) ---
    const initThreeJS = () => {
        const canvas = document.getElementById('bg-canvas');
        if(!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Create Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 400; // Subtle amount
        const posArray = new Float32Array(particlesCount * 3);

        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Green/Gold tint for particles
        const material = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x0a5c36, // Primary green
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);

        camera.position.z = 3;

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.y += 0.0005;
            particlesMesh.rotation.x += 0.0002;
            renderer.render(scene, camera);
        };
        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
    initThreeJS();

    // --- NAVBAR SCROLL EFFECT ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- SCROLL REVEAL ANIMATIONS ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            
            // Trigger counters if it's a metric section
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
            document.querySelector('[data-target="2025"]').setAttribute('data-target', savedMetrics.est || 2025);
            document.querySelector('[data-target="1500"]').setAttribute('data-target', savedMetrics.trusted || 1500);
            document.querySelector('[data-target="500"]').setAttribute('data-target', savedMetrics.guidance || 500);
            
            // Populate admin form
            document.getElementById('admin-est').value = savedMetrics.est || 2025;
            document.getElementById('admin-trusted').value = savedMetrics.trusted || 1500;
            document.getElementById('admin-guidance').value = savedMetrics.guidance || 500;
        } else {
            // Defaults
            document.getElementById('admin-est').value = 2025;
            document.getElementById('admin-trusted').value = 1500;
            document.getElementById('admin-guidance').value = 500;
        }
    };
    loadMetrics();

    const runCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
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

    window.saveMetrics = (e) => {
        e.preventDefault();
        const est = document.getElementById('admin-est').value;
        const trusted = document.getElementById('admin-trusted').value;
        const guidance = document.getElementById('admin-guidance').value;
        
        localStorage.setItem('ishq_metrics', JSON.stringify({ est, trusted, guidance }));
        alert('Metrics updated! Refresh page to see changes in animation.');
        closeModal('admin-modal');
    };

    // --- MODAL LOGIC ---
    window.openModal = (id) => {
        const modal = document.getElementById(id);
        modal.style.display = 'flex';
        // Small delay to allow display:flex to apply before adding opacity class
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    window.closeModal = (id) => {
        const modal = document.getElementById(id);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    };

    // Close modal on outside click
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    };

    // --- WHATSAPP FORM HANDLING ---
    window.handleRegistration = (e, type) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        let message = `*New ${type} Registration - ISHQ MATRIMONY*%0A%0A`;
        message += `*--- Personal Details ---*%0A`;
        
        for (let [key, value] of formData.entries()) {
            if(value.trim() !== '') {
                // Add spacing before preferences section
                if(key === 'PrefDistrict') {
                    message += `%0A*--- Partner Preferences ---*%0A`;
                }
                // Format camelCase keys to readable strings
                const readableKey = key.replace(/([A-Z])/g, ' $1').trim();
                message += `*${readableKey}:* ${value}%0A`;
            }
        }
        
        message += `%0A*Note:* I will attach my profile photo in the next message.`;
        
        const whatsappNumber = "917012297882";
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        // Open WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Reset form and close modal
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
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Add this to app.js
window.handleAdminUpdate = () => {
    const email = document.getElementById('adminEmailInput').value;
    const metricType = document.getElementById('metricSelectorField').value;
    const newValue = document.getElementById('metricNewValueInput').value;
    const console = document.getElementById('adminMessageConsole');

    const authorizedEmails = ['kmcshibu3@gmail.com', 'ishqmatrimony@gmail.com'];

    if (!authorizedEmails.includes(email.toLowerCase())) {
        console.innerText = "Access Denied: Unauthorized email address.";
        console.style.color = "red";
        return;
    }

    // Save logic
    let metrics = JSON.parse(localStorage.getItem('ishq_metrics')) || { est: 2025, trusted: 1500, guidance: 500 };
    
    // Map dropdown to existing keys
    if(metricType === 'projects') metrics.est = newValue;
    if(metricType === 'clients') metrics.trusted = newValue;
    if(metricType === 'hours') metrics.guidance = newValue;

    localStorage.setItem('ishq_metrics', JSON.stringify(metrics));
    
    console.innerText = "Success: Metric updated. Please refresh the page.";
    console.style.color = "green";
};

// Toggle Drawer Logic
document.getElementById('adminPanelToggleBtn')?.addEventListener('click', () => {
    document.getElementById('adminControlDrawer').classList.toggle('hidden');
});

document.getElementById('executeMetricUpdateBtn')?.addEventListener('click', window.handleAdminUpdate);



