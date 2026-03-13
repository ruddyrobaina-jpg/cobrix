document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            
            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar transparency change on scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.8)';
            nav.style.boxShadow = 'none';
        }
    });

    // --- Modal & Form Logic (Clean & Reliable) ---
    const modal = document.getElementById('contactModal');
    const openModalBtns = document.querySelectorAll('.open-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-success');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');
    
    if (modal && contactForm && submitBtn) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Main close function
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Wait for transition, then reset everything silently
            setTimeout(() => {
                contactForm.style.display = 'block';
                contactForm.style.opacity = '1';
                formSuccess.style.display = 'none';
                formSuccess.style.opacity = '0';
                if (btnText) btnText.style.opacity = '1';
                if (btnLoader) btnLoader.style.display = 'none';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 500);
        };

        // Open Modal
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close Modal
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Silent Submission Logic
        contactForm.addEventListener('submit', function() {
            // UI Animation: Processing Lead
            if (btnText) btnText.style.opacity = '0';
            if (btnLoader) btnLoader.style.display = 'block';
            submitBtn.disabled = true;

            // Browser handles submission to 'hidden_iframe' automatically.
            // We simulate the success transition for the user experience.
            setTimeout(() => {
                contactForm.style.transition = 'opacity 0.4s';
                contactForm.style.opacity = '0';
                
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                    setTimeout(() => {
                        formSuccess.style.opacity = '1';
                        formSuccess.style.transition = 'opacity 0.4s';
                    }, 50);
                }, 400);
            }, 1500);

            return true; // Let browser submit to iframe
        });
    }
});
