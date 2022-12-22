const darkButton = document.getElementById('dark');
const lightButton = document.getElementById('light');
const theme = localStorage.getItem('theme');

if (theme) {
    document.body?.classList.add(theme);
}

darkButton.onclick = () => {
    document.body.classList.replace('light', 'dark');
    localStorage.setItem('theme', 'dark');
}

lightButton.onclick = () => {
    document.body.classList.replace('dark', 'light');
    localStorage.setItem('theme', 'light');
}