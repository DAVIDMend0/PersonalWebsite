document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Sticky Navbar
    const navbar = document.getElementById("navbar");
    window.onscroll = function() {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    // 2. Theme Toggle Logic
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const body = document.body;
    
    // Check local storage for preference
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        // If saved theme is Light
        if (currentTheme === 'light') {
            body.classList.add('light-mode');
            toggleSwitch.checked = false; // Left = Light (Sun)
        } else {
            body.classList.remove('light-mode');
            toggleSwitch.checked = true; // Right = Dark (Moon)
        }
    } else {
        // Default (No history): Dark Mode -> Switch Checked
        toggleSwitch.checked = true;
    }

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            // User moved toggle to Right (Moon) -> Dark Mode
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            // User moved toggle to Left (Sun) -> Light Mode
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    });
});