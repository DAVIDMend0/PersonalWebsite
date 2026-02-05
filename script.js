document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. Sticky Navbar Logic ---
    const navbar = document.getElementById("navbar");
    window.onscroll = function() {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    // --- 2. Theme Toggle Logic ---
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');

    // Apply saved theme on load
    if (currentTheme) {
        if (currentTheme === 'light') {
            body.classList.add('light-mode');
            toggleSwitch.checked = false; // Left = Light
        } else {
            body.classList.remove('light-mode');
            toggleSwitch.checked = true; // Right = Dark
        }
    } else {
        toggleSwitch.checked = true; // Default to Dark
    }

    // Listen for switch change
    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- 3. POP-UP MODAL LOGIC (Crucial for "Learn More") ---
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    const closeModalButtons = document.querySelectorAll('.modal-close-btn');
    const overlay = document.getElementById('modal-overlay');

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        overlay.classList.add('active');
        // Prevent background scrolling
        document.body.style.overflow = 'hidden'; 
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        // Re-enable scrolling
        document.body.style.overflow = '';
        
        // Pause video if playing
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
        }
    }

    // Add click event to all "Learn More" buttons
    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Find which modal to open based on the HTML ID
            const modalId = button.getAttribute('data-modal-target');
            const modal = document.querySelector(modalId);
            openModal(modal);
        });
    });

    // Add click event to all "X" buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal if clicking on the dark background overlay
    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            closeModal(modal);
        });
    });
});

// --- 4. REACTION TIMER GAME LOGIC ---
    const gameStartBtn = document.getElementById('game-start-btn');
    const gameStopBtn = document.getElementById('game-stop-btn');
    const gameLights = document.querySelectorAll('.react-light');
    const seg1 = document.getElementById('seg-1');
    const seg2 = document.getElementById('seg-2');
    const seg3 = document.getElementById('seg-3');
    const gameMessage = document.getElementById('game-message');

    let gameState = 'idle'; // 'idle', 'sequence', 'waiting', 'finished'
    let startTime = 0;
    let timerInterval = null;
    let sequenceTimeouts = [];

    function updateDisplay(ms) {
        // Ensure it doesn't go over 999
        let clampedMs = Math.min(ms, 999);
        // Format to 3 digits (e.g., 5 -> "005")
        let formatted = clampedMs.toString().padStart(3, '0');
        seg1.textContent = formatted[0];
        seg2.textContent = formatted[1];
        seg3.textContent = formatted[2];
    }

    function clearSequence() {
        sequenceTimeouts.forEach(timeout => clearTimeout(timeout));
        sequenceTimeouts = [];
        clearInterval(timerInterval);
    }

    function resetGameUI() {
        gameLights.forEach(light => {
            light.classList.remove('red', 'green');
        });
        updateDisplay(0);
        gameStartBtn.disabled = false;
        gameStopBtn.disabled = true;
        gameState = 'idle';
    }

    gameStartBtn.addEventListener('click', () => {
        if (gameState !== 'idle') return;

        gameState = 'sequence';
        gameMessage.textContent = "Watch the lights...";
        gameStartBtn.disabled = true;
        gameStopBtn.disabled = false; // Enable stop for false start detection
        clearSequence();
        resetGameUI();
        // Re-disable start button after UI reset
        gameStartBtn.disabled = true; 
        gameStopBtn.disabled = false;


        // Sequence: Light 1-4 turn RED one by one
        let delay = 1000; // Start after 1 second
        gameLights.forEach((light, index) => {
            let t = setTimeout(() => {
                light.classList.add('red');
            }, delay);
            sequenceTimeouts.push(t);
            delay += 1000; // Add 1 second for the next light
        });

        // Random delay before turning GREEN (between 1 and 3.5 seconds after last red)
        const randomWait = Math.random() * 2500 + 1000; 
        let finalT = setTimeout(() => {
            if (gameState !== 'falseStart') {
               goGreen();
            }
        }, delay + randomWait);
        sequenceTimeouts.push(finalT);
    });

    function goGreen() {
        gameState = 'waiting';
        gameMessage.textContent = "GO!";
        // Turn all lights green instantly
        gameLights.forEach(light => {
            light.classList.remove('red');
            light.classList.add('green');
        });
        
        // Start Timer
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            updateDisplay(elapsed);
        }, 10); // Update every 10ms
    }

    gameStopBtn.addEventListener('click', () => {
        if (gameState === 'sequence') {
            // FALSE START! (Clicked before green)
            gameState = 'falseStart';
            clearSequence();
            gameMessage.textContent = "FALSE START! Too early.";
            gameMessage.style.color = "#c0392b";
            // Flash display to indicate error
            seg1.textContent = "F"; seg2.textContent = "A"; seg3.textContent = "L";
            setTimeout(resetGameUI, 2000);
            
        } else if (gameState === 'waiting') {
            // SUCCESS!
            clearInterval(timerInterval);
            gameState = 'finished';
            const finalTime = Date.now() - startTime;
            updateDisplay(finalTime);
            gameMessage.textContent = `Reaction Time: ${finalTime}ms`;
            gameMessage.style.color = ""; // Reset color
            gameStartBtn.disabled = false;
            gameStopBtn.disabled = true;
        }
    });
    // --- END REACTION TIMER GAME LOGIC ---