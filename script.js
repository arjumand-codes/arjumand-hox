// ============================================
// WEB-HOX - Enhanced Website Script (Fixed)
// ============================================

// --- 1. Initialize Smooth Scroll (Lenis) ---
const initSmoothScroll = () => {
    if (typeof Lenis === 'undefined') {
        console.warn('Lenis not loaded - using native scroll');
        return null;
    }
    
    try {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }

        console.log('✓ Smooth scroll initialized');
        return lenis;
    } catch (error) {
        console.error('Lenis initialization error:', error);
        return null;
    }
};

// --- 2. Initialize Three.js Background ---
const initThreeJS = () => {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded - skipping 3D background');
        return;
    }
    
    try {
        const canvas = document.querySelector('#bg-canvas');
        if (!canvas) {
            console.warn('Canvas element not found');
            return;
        }
        
        const scene = new THREE.Scene();
        
        const camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const group = new THREE.Group();
        scene.add(group);

        const geometry = new THREE.IcosahedronGeometry(8, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0xbd00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const core = new THREE.Mesh(geometry, material);
        group.add(core);

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1500;
        const posArray = new Float32Array(particlesCount * 3);

        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 80;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.08,
            color: 0x00f3ff,
            transparent: true,
            opacity: 0.8
        });

        const starField = new THREE.Points(particlesGeometry, particlesMaterial);
        group.add(starField);

        let mouseX = 0;
        let mouseY = 0;

        window.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) - 0.5;
            mouseY = (event.clientY / window.innerHeight) - 0.5;
        });

        const clock = new THREE.Clock();

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            core.rotation.y = elapsedTime * 0.1;
            core.rotation.x = elapsedTime * 0.05;
            starField.rotation.y = elapsedTime * 0.02;
            group.rotation.x += (mouseY * 0.5 - group.rotation.x) * 0.05;
            group.rotation.y += (mouseX * 0.5 - group.rotation.y) * 0.05;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        console.log('✓ Three.js background initialized');
    } catch (error) {
        console.error('Three.js initialization error:', error);
    }
};

// --- 3. Initialize GSAP Animations ---
const initGSAP = () => {
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded - content remains visible via CSS fallback');
        
        // Loader fallback without hiding any content
        setTimeout(() => {
            const loader = document.querySelector('.loader');
            if (loader) {
                loader.style.transition = 'transform 1s ease, opacity 0.5s ease';
                loader.style.transform = 'translateY(-100%)';
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 1000);
            }

            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroTagline = document.querySelector('.hero-tagline');
            const scrollIndicator = document.querySelector('.scroll-indicator');

            if (heroTitle) { heroTitle.style.opacity = '1'; heroTitle.style.transform = 'translateY(0)'; }
            if (heroSubtitle) { heroSubtitle.style.opacity = '1'; heroSubtitle.style.transform = 'translateY(0)'; }
            if (heroTagline) { heroTagline.style.opacity = '1'; heroTagline.style.transform = 'translateY(0)'; }
            if (scrollIndicator) { scrollIndicator.style.opacity = '1'; }
        }, 1500);
        
        return;
    }

    try {
        gsap.registerPlugin(ScrollTrigger);

        // ============================================
        // FIX: Add gsap-ready class so CSS fallback
        // knows GSAP is active and removes !important
        // overrides, allowing GSAP to control opacity
        // ============================================
        document.body.classList.add('gsap-ready');

        // ===== LOADER ANIMATION =====
        const tl = gsap.timeline();
        
        tl.to(".loader-bar-fill", {
            width: "100%",
            duration: 1.5,
            ease: "power2.inOut"
        })
        .to(".loader", {
            y: "-100%",
            duration: 1,
            ease: "expo.inOut",
            delay: 0.2,
            onComplete: () => {
                const loader = document.querySelector('.loader');
                if (loader) loader.style.display = 'none';
            }
        })
        .to(".hero-title", {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power4.out"
        }, "-=0.5")
        .to(".hero-subtitle", {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out"
        }, "-=1")
        .to(".hero-tagline", {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out"
        }, "-=0.8")
        .to(".scroll-indicator", {
            opacity: 1,
            duration: 1
        }, "-=0.5");

        // ===== PARALLAX EFFECTS =====
        gsap.utils.toArray('.parallax-slow').forEach(element => {
            gsap.to(element, {
                y: -100,
                scrollTrigger: {
                    trigger: element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.5
                }
            });
        });

        // ===== SECTION TITLES =====
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                scale: 0.95,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out"
            });
        });

        // ===== ABOUT SECTION =====
        gsap.from(".about-desc", {
            scrollTrigger: {
                trigger: "#about",
                start: "top 75%",
                toggleActions: "play none none reverse"
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".japanese-welcome", {
            scrollTrigger: {
                trigger: ".japanese-welcome",
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        gsap.from(".stat-item", {
            scrollTrigger: {
                trigger: ".stats-grid",
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)"
        });

        gsap.from(".glass-panel", {
            scrollTrigger: {
                trigger: ".glass-panel",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            scale: 0.95,
            duration: 1,
            ease: "power3.out"
        });

        gsap.from(".badge", {
            scrollTrigger: {
                trigger: ".mission-badges",
                start: "top 90%"
            },
            scale: 0,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(2)"
        });

        // ===== CULTURE SECTION =====
        gsap.from(".culture-card", {
            scrollTrigger: {
                trigger: ".culture-section",
                start: "top 75%",
                toggleActions: "play none none reverse"
            },
            y: 80,
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.4)"
        });

        gsap.from(".manifesto-box", {
            scrollTrigger: {
                trigger: ".manifesto-box",
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            scale: 0.95,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        // ===== MAC MOCKUP ANIMATIONS =====
        gsap.utils.toArray('.mac-mockup').forEach((mockup, index) => {
            gsap.from(mockup, {
                scrollTrigger: {
                    trigger: mockup,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 100,
                opacity: 0,
                scale: 0.95,
                duration: 1.2,
                ease: "power3.out"
            });

            const macText = mockup.querySelector('.mac-text');
            if (macText) {
                gsap.from(macText, {
                    scrollTrigger: {
                        trigger: mockup,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    },
                    x: -60,
                    opacity: 0,
                    duration: 1,
                    delay: 0.2,
                    ease: "power2.out"
                });
            }

            const macImage = mockup.querySelector('.mac-image-slot');
            if (macImage) {
                gsap.from(macImage, {
                    scrollTrigger: {
                        trigger: mockup,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    },
                    x: 60,
                    opacity: 0,
                    scale: 0.95,
                    duration: 1,
                    delay: 0.3,
                    ease: "power2.out"
                });
            }

            gsap.to(mockup, {
                y: -50,
                scrollTrigger: {
                    trigger: mockup,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.5
                }
            });
        });

        // ===== TEAM CARDS =====
        gsap.utils.toArray('.team-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                },
                y: 80,
                opacity: 0,
                scale: 0.9,
                duration: 0.8,
                delay: i * 0.1,
                ease: "back.out(1.4)"
            });

            gsap.to(card, {
                y: -30,
                scrollTrigger: {
                    trigger: card,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 2
                }
            });
        });

        // ===== TECH STACK TAGS =====
        gsap.utils.toArray('.tech-stack').forEach(stack => {
            const spans = stack.querySelectorAll('span');
            if (spans.length > 0) {
                gsap.from(spans, {
                    scrollTrigger: {
                        trigger: stack,
                        start: "top 90%"
                    },
                    opacity: 0,
                    scale: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "back.out(1.7)"
                });
            }
        });

        // ===== CONTACT SECTION =====
        gsap.from(".contact-item", {
            scrollTrigger: {
                trigger: ".contact-section",
                start: "top 80%"
            },
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        // ===== GLITCH HOVER EFFECT =====
        const glitchLinks = document.querySelectorAll('.glitch-hover');
        
        glitchLinks.forEach(link => {
            const originalText = link.getAttribute('data-text');
            if (!originalText) return;
            
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%&*";
            
            link.addEventListener('mouseenter', (event) => {
                let iterations = 0;
                const interval = setInterval(() => {
                    event.target.innerText = event.target.innerText
                        .split("")
                        .map((letter, index) => {
                            if(index < iterations) return originalText[index];
                            return letters[Math.floor(Math.random() * letters.length)];
                        })
                        .join("");
                    
                    if(iterations >= originalText.length) clearInterval(interval);
                    iterations += 1 / 2;
                }, 30);
            });
            
            link.addEventListener('mouseleave', (event) => {
                event.target.innerText = originalText;
            });
        });

        // ===== REFRESH after a tick to catch any in-viewport elements =====
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 300);

        console.log('✓ GSAP animations initialized');
    } catch (error) {
        console.error('GSAP initialization error:', error);
        // Safety net: if GSAP throws, remove gsap-ready so CSS fallback kicks in
        document.body.classList.remove('gsap-ready');
    }
};

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing WEB-HOX...');
    
    setTimeout(() => {
        const lenis = initSmoothScroll();
        initThreeJS();
        initGSAP();
        
        if (typeof ScrollTrigger !== 'undefined') {
            window.addEventListener('resize', () => {
                ScrollTrigger.refresh();
            });
        }
        
        console.log('✅ WEB-HOX fully initialized');
    }, 100);
});

