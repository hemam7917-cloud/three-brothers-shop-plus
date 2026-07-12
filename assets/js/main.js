"use strict";

/* =================================
   Sticky Header
================================= */
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");
const overlay = document.getElementById("overlay");

if (menuToggle && mainNav && overlay) {
    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("active");
        overlay.classList.toggle("active");

        const isOpen = mainNav.classList.contains("active");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    overlay.addEventListener("click", () => {
        mainNav.classList.remove("active");
        overlay.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    });
}



/* =================================
   Mobile Navigation
================================= */


/* =================================
   Back To Top
================================= */

const backToTop = document.getElementById("back-to-top");

if (backToTop) {
    window.addEventListener("scroll", () => {
        backToTop.classList.toggle(
            "show",
            window.scrollY > 300
        );
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}




/* =================================
   Preloader
================================= */

const preloader = document.getElementById("preloader");

window.addEventListener("load", () => {
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("hide");
        }, 300);
    }
});



/* =================================
   Skeleton Loading
================================= */

const skeleton = document.getElementById("product-skeleton");
const products = document.getElementById("featured-products");

window.addEventListener("load", () => {
    if (skeleton && products) {
        setTimeout(() => {
            skeleton.classList.add("hide");
            products.classList.remove("hide");
        }, 1500);
    }
});



/* =================================
   Theme Toggle
================================= */


const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
} else if (
    !savedTheme &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
) {
    document.body.classList.add("dark");
}

function updateThemeIcon() {
    if (!themeToggle) return;

    const isDark = document.body.classList.contains("dark");

    themeToggle.textContent = isDark ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
    );
}

updateThemeIcon();

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "theme",
            isDark ? "dark" : "light"
        );

        updateThemeIcon();
    });
}