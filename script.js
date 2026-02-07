document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. Sticky Navbar ---
    const navbar = document.getElementById("navbar");
    window.onscroll = function() {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    // --- 2. Theme Toggle ---
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        if (currentTheme === 'light') {
            body.classList.add('light-mode');
            toggleSwitch.checked = false; 
        } else {
            body.classList.remove('light-mode');
            toggleSwitch.checked = true;
        }
    } else {
        toggleSwitch.checked = true; 
    }
    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- 3. MODAL LOGIC ---
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    const closeModalButtons = document.querySelectorAll('.modal-close-btn');
    const overlay = document.getElementById('modal-overlay');

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        const videos = modal.querySelectorAll('video');
        videos.forEach(v => v.pause());
    }

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-target');
            const modal = document.querySelector(modalId);
            openModal(modal);
        });
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            closeModal(modal);
        });
    });

    // --- 4. CAROUSEL LOGIC (ROBUST VERSION) ---
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-button--right');
        const prevButton = carousel.querySelector('.carousel-button--left');
        
        // Dynamic Nav Dots
        const nav = document.createElement('div');
        nav.classList.add('carousel-nav');
        carousel.appendChild(nav);

        // Hide controls if only 1 slide
        if (slides.length <= 1) {
            if(nextButton) nextButton.style.display = 'none';
            if(prevButton) prevButton.style.display = 'none';
            nav.style.display = 'none';
        }

        // Create dots based on slide count
        slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.classList.add('carousel-indicator');
            if (index === 0) indicator.classList.add('current-slide');
            nav.appendChild(indicator);
            
            // Click dot to jump
            indicator.addEventListener('click', () => {
                moveToSlide(index);
            });
        });

        const dots = Array.from(nav.children);
        let currentIndex = 0;

        const moveToSlide = (targetIndex) => {
            // Update Slide Visibility
            slides.forEach((slide, idx) => {
                if (idx === targetIndex) {
                    slide.classList.add('current-slide');
                    slide.style.display = 'flex';
                    slide.style.opacity = '1';
                } else {
                    slide.classList.remove('current-slide');
                    slide.style.display = 'none';
                    slide.style.opacity = '0';
                    // Pause video on hidden slide
                    const video = slide.querySelector('video');
                    if(video) video.pause();
                }
            });

            // Update Dots
            dots.forEach((dot, idx) => {
                if (idx === targetIndex) dot.classList.add('current-slide');
                else dot.classList.remove('current-slide');
            });

            currentIndex = targetIndex;
        };

        // Initialize state
        moveToSlide(0);

        if(nextButton) {
            nextButton.addEventListener('click', () => {
                const newIndex = (currentIndex + 1) % slides.length;
                moveToSlide(newIndex);
            });
        }

        if(prevButton) {
            prevButton.addEventListener('click', () => {
                const newIndex = (currentIndex - 1 + slides.length) % slides.length;
                moveToSlide(newIndex);
            });
        }
    });

    // --- 5. REACTION TIMER GAME ---
    const gameStartBtn = document.getElementById('game-start-btn');
    if(gameStartBtn) { 
        const gameStopBtn = document.getElementById('game-stop-btn');
        const gameLights = document.querySelectorAll('.react-light');
        const displayContainer = document.querySelector('.seven-segment-display');
        const seg1 = document.getElementById('seg-1');
        const seg2 = document.getElementById('seg-2');
        const seg3 = document.getElementById('seg-3');
        const gameMessage = document.getElementById('game-message');

        let gameState = 'idle'; 
        let startTime = 0;
        let timerInterval = null;
        let sequenceTimeouts = [];

        function updateDisplay(ms) {
            let clampedMs = Math.min(ms, 999);
            let formatted = clampedMs.toString().padStart(3, '0');
            seg1.textContent = formatted[0];
            seg2.textContent = formatted[1];
            seg3.textContent = formatted[2];
            return clampedMs;
        }

        function clearSequence() {
            sequenceTimeouts.forEach(timeout => clearTimeout(timeout));
            sequenceTimeouts = [];
            clearInterval(timerInterval);
        }

        function resetGameUI() {
            gameLights.forEach(light => {
                light.classList.remove('red', 'green', 'blinking');
            });
            updateDisplay(0);
            displayContainer.classList.remove('dimmed');
            gameStartBtn.textContent = "Start Sequence";
            gameStartBtn.disabled = false;
            gameStopBtn.disabled = true;
            gameMessage.textContent = "";
            gameMessage.style.color = "";
            gameState = 'idle';
        }

        function triggerTimeout() {
            clearInterval(timerInterval);
            gameState = 'finished';
            gameMessage.textContent = "Too Slow! Try Again?";
            gameMessage.style.color = "#e74c3c";
            displayContainer.classList.add('dimmed');
            gameLights.forEach(light => {
                light.classList.remove('green');
                light.classList.add('red', 'blinking');
            });
            gameStartBtn.textContent = "Try Again";
            gameStartBtn.disabled = false;
            gameStopBtn.disabled = true;
        }

        gameStartBtn.addEventListener('click', () => {
            if (gameState !== 'idle') { resetGameUI(); }
            gameState = 'sequence';
            gameMessage.textContent = "Watch the lights...";
            gameStartBtn.disabled = true;
            gameStopBtn.disabled = false; 
            clearSequence();

            let delay = 1000; 
            gameLights.forEach((light) => {
                let t = setTimeout(() => {
                    light.classList.add('red');
                }, delay);
                sequenceTimeouts.push(t);
                delay += 1000; 
            });

            const randomWait = Math.random() * 2500 + 1000; 
            let finalT = setTimeout(() => {
                if (gameState !== 'falseStart') { goGreen(); }
            }, delay + randomWait);
            sequenceTimeouts.push(finalT);
        });

        function goGreen() {
            gameState = 'waiting';
            gameMessage.textContent = "GO!";
            gameLights.forEach(light => {
                light.classList.remove('red');
                light.classList.add('green');
            });
            startTime = Date.now();
            timerInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                if (elapsed >= 999) {
                    updateDisplay(999);
                    triggerTimeout();
                } else {
                    updateDisplay(elapsed);
                }
            }, 10);
        }

        gameStopBtn.addEventListener('click', () => {
            if (gameState === 'sequence') {
                gameState = 'falseStart';
                clearSequence();
                gameMessage.textContent = "FALSE START!";
                gameMessage.style.color = "#e74c3c";
                seg1.textContent = "F"; seg2.textContent = "A"; seg3.textContent = "L";
                gameStartBtn.textContent = "Try Again";
                gameStartBtn.disabled = false;
                gameStopBtn.disabled = true;
            } else if (gameState === 'waiting') {
                clearInterval(timerInterval);
                gameState = 'finished';
                const finalTime = Date.now() - startTime;
                updateDisplay(finalTime);
                gameMessage.textContent = `Reaction Time: ${finalTime}ms`;
                gameMessage.style.color = "#2ecc71";
                gameStartBtn.textContent = "Play Again";
                gameStartBtn.disabled = false;
                gameStopBtn.disabled = true;
            }
        });
    }
});