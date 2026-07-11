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

const backToTop = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {

    if(window.scrollY > 300){

        backToTop.classList.add("show");

    }else{

        backToTop.classList.remove("show");

    }

});


backToTop.addEventListener("click", () => {

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});


const preloader = document.getElementById("preloader");

window.addEventListener("load", () => {

    setTimeout(() => {

        preloader.classList.add("hide");

    }, 300);

});


const skeleton = document.getElementById("product-skeleton");

const products = document.getElementById("featured-products");

window.addEventListener("load", () => {

    setTimeout(() => {

        skeleton.classList.add("hide");

        products.classList.remove("hide");

    },1500);

});