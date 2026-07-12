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
const featuredProducts = document.getElementById("featured-products");

window.addEventListener("load", () => {
    if (skeleton && featuredProducts) {
        setTimeout(() => {
            skeleton.classList.add("hide");
            featuredProducts.classList.remove("hide");
        }, 800);
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

/* =================================
   Shopping Cart State
================================= */

const cart = [];

const cartCount = document.getElementById("cart-count");

function updateCartCount() {
    if (!cartCount) return;

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;
}

function addToCart(productId) {
    const selectedProduct = products.find(
        (product) => product.id === productId
    );

    if (!selectedProduct) {
        console.error("Product not found.");
        return;
    }

    const existingCartItem = cart.find(
        (item) => item.id === productId
    );

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            ...selectedProduct,
            quantity: 1
        });
    }

    updateCartCount();

    console.log("Cart:", cart);
}

updateCartCount();

/* =================================
   Dynamic Product Rendering
================================= */

const productGrid = document.getElementById("product-grid");

function renderProducts(productList) {
    if (!productGrid) return;

    productGrid.innerHTML = "";

    productList.forEach((product) => {
        const productCard = document.createElement("article");

        productCard.className = "product-card";

        productCard.innerHTML = `
            <span class="product-badge">
                ${product.badge}
            </span>

            <img
                src="${product.image}"
                alt="${product.name}"
                width="800"
                height="800"
                loading="lazy"
                decoding="async">

            <h3>${product.name}</h3>

            <p class="rating">
                ⭐ ${product.rating} (${product.reviews} Reviews)
            </p>

            <p class="price">
                ৳${product.price}
            </p>

            <div class="product-actions">

                <button
                    type="button"
                    class="wishlist-btn"
                    data-product-id="${product.id}"
                    aria-label="Add ${product.name} to Wishlist">
                    ❤️
                </button>

                <button
                    type="button"
                    class="cart-btn"
                    data-product-id="${product.id}"
                    aria-label="Add ${product.name} to Cart">
                    🛒 Add to Cart
                </button>

            </div>
        `;

        productGrid.appendChild(productCard);
    });
}

if (typeof products !== "undefined") {
    renderProducts(products);
}


/* =================================
   Add to Cart Event
================================= */

if (productGrid) {
    productGrid.addEventListener("click", (event) => {
        const cartButton = event.target.closest(".cart-btn");

        if (!cartButton) return;

        const productId = Number(
            cartButton.dataset.productId
        );

        addToCart(productId);
    });
}

function addToCart(productId) {
    const selectedProduct = products.find(
        (product) => product.id === productId
    );

    if (!selectedProduct) {
        console.error("Product not found.");
        return;
    }

    const existingCartItem = cart.find(
        (item) => item.id === productId
    );

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            ...selectedProduct,
            quantity: 1
        });
    }

    console.log("Cart:", cart);
}


/* ================================
updatecartcount()
================================= */

function updateCartCount() {
    if (!cartCount) return;

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;
}