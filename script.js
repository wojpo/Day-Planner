const toggleMenu = document.getElementById('toggleMenu')
const closeMenu = document.getElementById('closeMenu')
const settingsMenu = document.getElementById('settingsMenu')

toggleMenu.addEventListener('click', () => {
    settingsMenu.classList.toggle('menu-hidden');
    settingsMenu.classList.toggle('menu-visible');
    toggleMenu.classList.toggle('button-shifted');
});

closeMenu.addEventListener('click', () => {
    settingsMenu.classList.add('menu-hidden');
    settingsMenu.classList.remove('menu-visible');
    toggleMenu.classList.remove('button-shifted');
});