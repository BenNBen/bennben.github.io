const themeToggle = document.getElementById('theme');
const theme = localStorage.getItem('theme');

if (theme) {
    document.body?.classList.add(theme);
}

themeToggle.onclick = () => {
    if(localStorage.getItem('theme') === 'dark'){
        document.body.classList.replace('dark', 'light');
        localStorage.setItem('theme', 'light');
    }else{
        document.body.classList.replace('light', 'dark');
        localStorage.setItem('theme', 'dark');
    }  
}

/*
const techButton = document.getElementById("techStackButton");
const content = document.getElementById("techContent");
content.style.display = 'none';
techButton.addEventListener("click", function () {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
});*/