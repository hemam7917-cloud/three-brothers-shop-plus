const header = document.getElementById("main-header");

window.addEventListener("scroll", function () {

    if(window.scrollY > 40){

        header.classList.add("scrolled");

    }else{

        header.classList.remove("scrolled");

    }

});

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", () => {

    mainNav.classList.toggle("active");

    overlay.classList.toggle("active");

});

