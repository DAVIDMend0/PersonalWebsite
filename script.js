document.addEventListener("DOMContentLoaded", function() {
    
    // --- STICKY NAVBAR LOGIC ---
    const navbar = document.getElementById("navbar");
    window.onscroll = function() {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    // --- ANIMATED THEME TOGGLE LOGIC ---
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');

    // 1. Check if user has a previously saved preference
    if (currentTheme) {
        body.classList.add(currentTheme + '-mode'); // Adds 'light-mode' if saved
        
        if (currentTheme === 'light') {
            toggleSwitch.checked = true; // Syncs the slider position
        }
    }

    // 2. Listen for the switch change event
    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            // Switch moved to "on" position -> Light Mode
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            // Switch moved to "off" position -> Dark Mode
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    });
});