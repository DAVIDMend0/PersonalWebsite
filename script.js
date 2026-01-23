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