function get_system_theme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function set_theme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    update_theme_icon(theme);
}

function update_theme_icon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill';
    } else {
        icon.className = 'bi bi-moon-fill';
    }
}

function init_theme() {
    const saved_theme = localStorage.getItem('theme');
    const theme = saved_theme || get_system_theme();
    set_theme(theme);
}

function toggle_theme() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const new_theme = current === 'dark' ? 'light' : 'dark';
    set_theme(new_theme);
}

init_theme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        set_theme(e.matches ? 'dark' : 'light');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const theme_toggle = document.getElementById('theme-toggle');
    if (theme_toggle) {
        theme_toggle.addEventListener('click', toggle_theme);
    }
});
