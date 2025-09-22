const toggleMenu = document.getElementById('toggleMenu');
const settingsMenu = document.getElementById('settingsMenu');

// Toggle settings menu
toggleMenu.addEventListener('click', () => {
    settingsMenu.classList.toggle('menu-hidden');
    settingsMenu.classList.toggle('menu-visible');
    toggleMenu.classList.toggle('button-shifted');
});