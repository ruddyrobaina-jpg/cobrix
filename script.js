import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Config cargada desde firebase-config.js (no incluido en git)
const firebaseConfig = window.FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
            nav.style.background = 'rgba(18, 11, 36, 0.98)';
            nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.4)';
        } else {
            nav.style.background = 'rgba(18, 11, 36, 0.85)';
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

    // --- Easter Egg: Acceso Administrativo (5 clics rápidos en logo) ---
    const logoLink = document.querySelector('.logo-link');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const closeAdminModalBtns = document.querySelectorAll('.close-admin-modal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    let logoClickCount = 0;
    let logoClickTimer = null;

    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            // Prevenir doble ejecución o scroll al clickear rápido
            if(logoClickCount > 0) e.preventDefault();
            
            logoClickCount++;
            
            if (logoClickCount >= 5) {
                // Trigger easter egg
                if(adminLoginModal) {
                    adminLoginModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
                logoClickCount = 0; // Reset
            }

            clearTimeout(logoClickTimer);
            logoClickTimer = setTimeout(() => {
                logoClickCount = 0;
            }, 2000);
        });
    }

    if (adminLoginModal) {
        closeAdminModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                adminLoginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        if(adminLoginForm) {
            adminLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const adminSubmitBtn = document.getElementById('adminSubmitBtn');
                const btnText = adminSubmitBtn.querySelector('.btn-text');
                const btnLoader = adminSubmitBtn.querySelector('.btn-loader');
                const errorDiv = document.getElementById('adminFormError');
                
                const email = document.getElementById('adminEmail').value;
                const password = document.getElementById('adminPass').value;

                // UX: Loading state
                btnText.style.display = 'none';
                btnLoader.style.display = 'block';
                errorDiv.style.display = 'none';

                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    // Si el login es exitoso, Firebase guarda la sesión.
                    // Redirigimos al portal administrativo
                    window.location.href = 'portal.html';
                } catch (error) {
                    btnText.style.display = 'block';
                    btnLoader.style.display = 'none';
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = 'Credenciales incorrectas o no autorizadas.';
                    console.error("Auth error:", error);
                }
            });
        }
    }

    // --- Presentation Mode Logic ---
    const presentationOverlay = document.getElementById('presentationOverlay');
    const openPresBtns = document.querySelectorAll('.open-presentation');
    const closePresBtn = document.querySelector('.close-presentation');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    const slides = document.querySelectorAll('.slide');
    const slideCounter = document.querySelector('.slide-counter');
    const progressBar = document.querySelector('.progress-bar');
    const openModalFromPresBtn = document.querySelector('.open-modal-from-pres');
    const soundToggle = document.querySelector('.sound-toggle');
    const soundOnIcon = document.querySelector('.sound-on-icon');
    const soundOffIcon = document.querySelector('.sound-off-icon');

    let currentSlide = 0;
    const totalSlides = slides.length;
    let isSoundEnabled = true;

    // --- Audio System (Web Audio API) ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playNavigationSound = () => {
        if (!isSoundEnabled) return;
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    };

    const updatePresentation = (withSound = true) => {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        
        if (withSound) playNavigationSound();
        
        // Update Counter
        if (slideCounter) slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
        
        // Update Progress Bar
        if (progressBar) {
            const progress = ((currentSlide + 1) / totalSlides) * 100;
            progressBar.style.width = `${progress}%`;
        }
    };

    const openPresentation = () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        presentationOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentSlide = 0;
        updatePresentation(false);
    };

    const closePresentation = () => {
        presentationOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updatePresentation();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            currentSlide--;
            updatePresentation();
        }
    };

    // Event Listeners
    openPresBtns.forEach(btn => btn.addEventListener('click', openPresentation));
    if (closePresBtn) closePresBtn.addEventListener('click', closePresentation);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Sound Toggle Logic
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            soundOnIcon.style.display = isSoundEnabled ? 'block' : 'none';
            soundOffIcon.style.display = isSoundEnabled ? 'none' : 'block';
            if (isSoundEnabled) playNavigationSound();
        });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!presentationOverlay.classList.contains('active')) return;
        
        if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') closePresentation();
    });

    // Special: Open contact modal from presentation
    if (openModalFromPresBtn) {
        openModalFromPresBtn.addEventListener('click', () => {
            closePresentation();
            setTimeout(() => {
                const modal = document.getElementById('contactModal');
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }, 500);
        });
    }

    // --- Quick Guide Modal Logic ---
    const guideModal = document.getElementById('guideModal');
    const openGuideBtn = document.querySelector('.open-guide-modal');
    const closeGuideBtn = document.querySelector('.close-guide-modal');

    if (guideModal && openGuideBtn && closeGuideBtn) {
        openGuideBtn.addEventListener('click', () => {
            guideModal.classList.add('active');
            guideModal.style.display = 'flex'; // Ensure flex for centering
            document.body.style.overflow = 'hidden';
        });

        const closeGuide = () => {
            guideModal.classList.remove('active');
            setTimeout(() => {
                guideModal.style.display = 'none';
            }, 500);
            document.body.style.overflow = 'auto';
        };

        closeGuideBtn.addEventListener('click', closeGuide);
        
        window.addEventListener('click', (e) => {
            if (e.target === guideModal) closeGuide();
        });
    }
});
