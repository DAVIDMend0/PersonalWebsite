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

// --- 4. REACTION TIMER GAME LOGIC (UPDATED) ---
    const gameStartBtn = document.getElementById('game-start-btn');
    const gameStopBtn = document.getElementById('game-stop-btn');
    const gameLights = document.querySelectorAll('.react-light');
    const displayContainer = document.querySelector('.seven-segment-display'); // Get container to dim it
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
        // Clear lights
        gameLights.forEach(light => {
            light.classList.remove('red', 'green', 'blinking');
        });
        
        // Reset Display
        updateDisplay(0);
        displayContainer.classList.remove('dimmed');
        
        // Reset Buttons
        gameStartBtn.textContent = "Start Sequence";
        gameStartBtn.disabled = false;
        gameStopBtn.disabled = true;
        
        gameMessage.textContent = "";
        gameMessage.style.color = "";
        
        gameState = 'idle';
    }

    // --- TIMEOUT HANDLER (Too Slow) ---
    function triggerTimeout() {
        clearInterval(timerInterval);
        gameState = 'finished';
        
        // Visuals for failure
        gameMessage.textContent = "Too Slow! Try Again?";
        gameMessage.style.color = "#e74c3c"; // Red text
        
        // Grey out numbers
        displayContainer.classList.add('dimmed');
        
        // Blink lights red
        gameLights.forEach(light => {
            light.classList.remove('green');
            light.classList.add('red', 'blinking');
        });

        // Enable Restart
        gameStartBtn.textContent = "Try Again";
        gameStartBtn.disabled = false;
        gameStopBtn.disabled = true;
    }

    gameStartBtn.addEventListener('click', () => {
        // If game is finished or idle, we reset and start
        if (gameState !== 'idle') {
            resetGameUI();
        }

        gameState = 'sequence';
        gameMessage.textContent = "Watch the lights...";
        gameStartBtn.disabled = true;
        gameStopBtn.disabled = false; 
        clearSequence();

        // Sequence: Lights turn RED one by one
        let delay = 1000; 
        gameLights.forEach((light) => {
            let t = setTimeout(() => {
                light.classList.add('red');
            }, delay);
            sequenceTimeouts.push(t);
            delay += 1000; 
        });

        // Random delay for GREEN
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
        
        gameLights.forEach(light => {
            light.classList.remove('red');
            light.classList.add('green');
        });
        
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            // CHECK FOR TIMEOUT (If > 999ms)
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
            // FALSE START
            gameState = 'falseStart';
            clearSequence();
            gameMessage.textContent = "FALSE START!";
            gameMessage.style.color = "#e74c3c";
            
            seg1.textContent = "F"; seg2.textContent = "A"; seg3.textContent = "L";
            
            // Allow restart immediately
            gameStartBtn.textContent = "Try Again";
            gameStartBtn.disabled = false;
            gameStopBtn.disabled = true;

        } else if (gameState === 'waiting') {
            // SUCCESS
            clearInterval(timerInterval);
            gameState = 'finished';
            const finalTime = Date.now() - startTime;
            updateDisplay(finalTime);
            
            gameMessage.textContent = `Reaction Time: ${finalTime}ms`;
            gameMessage.style.color = "#2ecc71"; // Green text for success
            
            // Allow restart
            gameStartBtn.textContent = "Play Again";
            gameStartBtn.disabled = false;
            gameStopBtn.disabled = true;
        }
    });