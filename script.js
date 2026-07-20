/* =============================================
   Creativos Craft — Interactive Scripts
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    // --- Floating Particles ---
    const particleContainer = document.getElementById('bgParticles');
    if (particleContainer) {
        const emojis = ['✦', '◆', '✧', '○', '△', '□', '⬡', '⬟'];
        const particleCount = 10;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.classList.add('bg-particle');
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = 14 + Math.random() * 20 + 's';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.fontSize = 0.6 + Math.random() * 1 + 'rem';
            particleContainer.appendChild(particle);
        }
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    const handleScroll = () => {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (backToTop) {
            if (scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- Back to Top ---
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Mobile Nav Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    let overlay = null;

    if (navToggle && navLinks) {
        const toggleMobileNav = () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');

            if (navLinks.classList.contains('open')) {
                overlay = document.createElement('div');
                overlay.classList.add('nav-overlay', 'active');
                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden';
                overlay.addEventListener('click', toggleMobileNav);
            } else {
                if (overlay) {
                    overlay.remove();
                    overlay = null;
                }
                document.body.style.overflow = '';
            }
        };

        navToggle.addEventListener('click', toggleMobileNav);

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('open')) {
                    toggleMobileNav();
                }
            });
        });
    }

    // --- Scroll-triggered Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
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

    document.querySelectorAll('.product-card').forEach(card => observer.observe(card));
    document.querySelectorAll('.category-card').forEach(card => observer.observe(card));
    document.querySelectorAll('.process-step').forEach(step => observer.observe(step));

    // --- Animated Counters ---
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let countersAnimated = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsContainer = document.querySelector('.hero-stats');
    if (statsContainer) {
        counterObserver.observe(statsContainer);
    }

    function animateCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                stat.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // --- Category card hover glow follow mouse ---
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(168, 85, 247, 0.12) 0%, transparent 60%)`;
                glow.style.opacity = '1';
            }
        });

        card.addEventListener('mouseleave', () => {
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.opacity = '0';
            }
        });
    });

    // --- Floating WhatsApp Button ---
    const waButton = document.createElement('a');
    waButton.className = 'whatsapp-float';
    waButton.setAttribute('aria-label', 'Chat en WhatsApp');
    waButton.setAttribute('target', '_blank');
    waButton.setAttribute('rel', 'noopener noreferrer');
    waButton.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.381 9.805-9.768.002-2.607-1.012-5.059-2.859-6.908C16.371 2.08 13.927.822 11.32.82 5.923.82 1.52 5.2 1.517 10.584c-.001 1.502.4 2.966 1.163 4.237l-.993 3.626 3.716-.972zm12.39-5.466c-.33-.165-1.951-.963-2.251-1.074-.3-.11-.518-.165-.736.165-.218.33-.844 1.074-1.034 1.293-.19.219-.38.247-.71.082-1.396-.698-2.42-1.218-3.414-2.924-.26-.447.26-.415.746-1.383.08-.165.04-.308-.02-.473-.06-.165-.518-1.252-.71-1.714-.19-.459-.38-.396-.518-.403-.13-.007-.28-.009-.43-.009-.15 0-.395.056-.602.282-.207.226-.79.772-.79 1.882 0 1.11.808 2.182.92 2.336.112.154 1.59 2.427 3.852 3.4c.538.23 1.037.382 1.396.497.54.172 1.03.147 1.416.09.43-.064 1.952-.798 2.228-1.57.275-.772.275-1.436.19-1.57-.082-.134-.3-.218-.63-.383z"/>
        </svg>
    `;
    
    const phone = '59893365772';
    const text = encodeURIComponent('¡Hola Creativos Craft! Quisiera realizar una consulta sobre sus productos.');
    
    const updateWaUrl = () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const baseUrl = isMobile ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
        const url = `${baseUrl}?phone=${phone}&text=${text}`;
        waButton.href = url;
        document.querySelectorAll('.whatsapp-link').forEach(link => {
            link.href = url;
        });
    };
    
    updateWaUrl();
    window.addEventListener('resize', updateWaUrl);
    document.body.appendChild(waButton);

    // Initial scroll check
    handleScroll();
});
