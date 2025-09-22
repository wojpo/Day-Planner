const toggleMenu = document.getElementById('toggleMenu');
const settingsMenu = document.getElementById('settingsMenu');
const themeLink = document.getElementById('themeLink');
const backToSettings = document.getElementById('backToSettings');
const mainSettings = document.getElementById('mainSettings');
const themeSettings = document.getElementById('themeSettings');

// Toggle settings menu
toggleMenu.addEventListener('click', () => {
    settingsMenu.classList.toggle('menu-hidden');
    settingsMenu.classList.toggle('menu-visible');
    toggleMenu.classList.toggle('button-shifted');
});

// Show theme settings
themeLink.addEventListener('click', (e) => {
    e.preventDefault();
    mainSettings.classList.add('hidden');
    themeSettings.classList.remove('hidden');
});

// Back to main settings
backToSettings.addEventListener('click', () => {
    mainSettings.classList.remove('hidden');
    themeSettings.classList.add('hidden');
});

// Theme configuration
const themeConfig = [
    { id: 'bodyBg', var: '--bg-body', default: '#030712' },
    { id: 'panelBg', var: '--bg-panel', default: '#111827' },
    { id: 'textBody', var: '--text-body', default: '#e5e7eb' },
    { id: 'textHeader', var: '--text-header', default: '#f3f4f6' },
    { id: 'accentAdd', var: '--accent-add', default: '#60a5fa' },
    { id: 'accentAddHover', var: '--accent-add-hover', default: '#93c5fd' },
    { id: 'bgTask', var: '--bg-task', default: '#1f2937' },
    { id: 'bgInput', var: '--bg-input', default: '#374151' },
    { id: 'textInput', var: '--text-input', default: '#e5e7eb' },
    { id: 'ringFocus', var: '--ring-focus', default: '#4ade80' },
    { id: 'textTimer', var: '--text-timer', default: '#4ade80' },
    { id: 'bgTimer', var: '--bg-timer', default: '#111827' },
    { id: 'bgPlay', var: '--bg-play', default: '#16a34a' },
    { id: 'bgPlayHover', var: '--bg-play-hover', default: '#22c55e' },
    { id: 'bgDelete', var: '--bg-delete', default: '#dc2626' },
    { id: 'bgDeleteHover', var: '--bg-delete-hover', default: '#ef4444' },
    { id: 'textButton', var: '--text-button', default: '#ffffff' },
    { id: 'bgToggle', var: '--bg-toggle', default: '#1f2937' },
    { id: 'bgToggleHover', var: '--bg-toggle-hover', default: '#374151' },
    { id: 'textToggle', var: '--text-toggle', default: '#ffffff' },
    { id: 'accentSettingsHover', var: '--accent-settings-hover', default: '#3b82f6' },
    { id: 'borderSecondary', var: '--border-secondary', default: '#1f2937' },
    { id: 'borderRunning', var: '--border-running', default: '#22c55e' },
];

// Load saved theme
themeConfig.forEach(({ id, var: cssVar, default: def }) => {
    const saved = localStorage.getItem(`theme${id}`);
    const value = saved || def;
    document.documentElement.style.setProperty(cssVar, value);
    const input = document.getElementById(id);
    if (input) input.value = value;
});

// Attach listeners to color pickers
themeConfig.forEach(({ id, var: cssVar }) => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', () => {
            document.documentElement.style.setProperty(cssVar, input.value);
            localStorage.setItem(`theme${id}`, input.value);
        });
    }
});