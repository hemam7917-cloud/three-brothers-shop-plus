"use strict";

/* =================================
   Sticky Header
================================= */

const mainHeader =
    document.getElementById("main-header");

if (mainHeader) {
    window.addEventListener("scroll", () => {
        mainHeader.classList.toggle(
            "scrolled",
            window.scrollY > 40
        );
    });
}


/* =================================
   Mobile Navigation
================================= */

const menuToggle =
    document.getElementById("menu-toggle");

const mainNav =
    document.getElementById("main-nav");

const overlay =
    document.getElementById("overlay");

if (menuToggle && mainNav && overlay) {
    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("active");
        overlay.classList.toggle("active");

        const isOpen =
            mainNav.classList.contains("active");

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
   Back To Top
================================= */

const backToTop =
    document.getElementById("back-to-top");

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

const preloader =
    document.getElementById("preloader");

window.addEventListener("load", () => {
    if (!preloader) return;

    setTimeout(() => {
        preloader.classList.add("hide");
    }, 300);
});


/* =================================
   Theme Toggle
================================= */

const themeToggle =
    document.getElementById("theme-toggle");

const savedTheme =
    localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
} else if (
    !savedTheme &&
    window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
) {
    document.body.classList.add("dark");
}

function updateThemeIcon() {
    if (!themeToggle) return;

    const isDark =
        document.body.classList.contains("dark");

    themeToggle.textContent =
        isDark ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to Light Mode"
            : "Switch to Dark Mode"
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
   Product DOM Elements
================================= */

const productGrid =
    document.getElementById("product-grid");

const productSearch =
    document.getElementById("product-search");

const searchStatus =
    document.getElementById("search-status");

const categoryFilter =
    document.getElementById("category-filter");

const clearFiltersButton =
    document.getElementById("clear-filters");

const skeleton =
    document.getElementById("product-skeleton");

const featuredProducts =
    document.getElementById("featured-products");


/* =================================
   Shopping Cart State
================================= */

const CART_STORAGE_KEY = "tbsp-cart";

function loadCart() {
    try {
        const savedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );

        if (!savedCart) {
            return [];
        }

        const parsedCart =
            JSON.parse(savedCart);

        return Array.isArray(parsedCart)
            ? parsedCart
            : [];

    } catch (error) {
        console.error(
            "Failed to load cart:",
            error
        );

        return [];
    }
}

let cart =
    loadStorageArray(
        CART_STORAGE_KEY
    );

function refreshCartFromStorage() {
    cart =
        loadStorageArray(
            CART_STORAGE_KEY
        );

    updateCartCount();
}

window.addEventListener(
    "pageshow",
    () => {
        refreshCartFromStorage();
        refreshWishlistFromStorage();
    }
);

const cartCount =
    document.getElementById("cart-count");

function updateCartCount() {
    if (!cartCount) return;

    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );

    cartCount.textContent =
        totalQuantity;
}

function addToCart(productId) {
    const selectedProduct =
        products.find(
            (product) =>
                product.id === productId
        );

    if (!selectedProduct) {
        showToast(
            "Product not found.",
            "error"
        );

        return;
    }

    const existingCartItem =
        cart.find(
            (item) =>
                item.id === productId
        );

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            ...selectedProduct,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();

    showToast(
        `${selectedProduct.name} added to cart.`,
        "success"
    );

    console.log(
        "Cart:",
        cart
    );
}


/* =================================
   Wishlist State
================================= */

const WISHLIST_STORAGE_KEY =
    "tbsp-wishlist";

function saveWishlist() {
    saveStorageArray(
        WISHLIST_STORAGE_KEY,
        wishlist
    );
}

let wishlist =
    loadStorageArray(
        WISHLIST_STORAGE_KEY
    );

function refreshWishlistFromStorage() {
    wishlist =
        loadStorageArray(
            WISHLIST_STORAGE_KEY
        );

    updateWishlistCount();

    if (
        typeof products !== "undefined" &&
        productGrid
    ) {
        applyProductFilters();
    }
}

const wishlistCount =
    document.getElementById(
        "wishlist-count"
    );

function updateWishlistCount() {
    if (!wishlistCount) return;

    wishlistCount.textContent =
        wishlist.length;
}

function isProductInWishlist(productId) {
    return wishlist.some(
        (item) =>
            item.id === productId
    );
}

function toggleWishlist(productId) {
    const selectedProduct =
        products.find(
            (product) =>
                product.id === productId
        );

    if (!selectedProduct) {
        showToast(
            "Wishlist product not found.",
            "error"
        );

        return;
    }

    const exists =
        isProductInWishlist(
            productId
        );

    if (exists) {
        wishlist =
            wishlist.filter(
                (item) =>
                    item.id !== productId
            );

        showToast(
            `${selectedProduct.name} removed from wishlist.`,
            "info"
        );
    } else {
        wishlist.push({
            ...selectedProduct
        });

        showToast(
            `${selectedProduct.name} added to wishlist.`,
            "success"
        );
    }

    saveWishlist();
    updateWishlistCount();
    applyProductFilters();
}


/* =================================
   Dynamic Product Rendering
================================= */

function renderProducts(productList) {
    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (
        !Array.isArray(productList) ||
        productList.length === 0
    ) {
        productGrid.innerHTML = `
            <div class="product-empty-state">

                <div
                    class="product-empty-icon"
                    aria-hidden="true">
                    🔍
                </div>

                <h3>
                    No Products Found
                </h3>

                <p>
                    Try searching with a different
                    product name or category.
                </p>

            </div>
        `;

        return;
    }

    productList.forEach((product) => {
        const productCard =
            document.createElement(
                "article"
            );

        const isWishlisted =
            isProductInWishlist(
                product.id
            );

        productCard.className =
            "product-card";

        productCard.dataset.productId =
            product.id;

        productCard.innerHTML = `
            <span class="product-badge">
                ${product.badge || ""}
            </span>

            <a
    href="product-details.html?id=${product.id}"
    class="product-image-link"
    aria-label="View details for ${product.name}">

    <img
        src="${product.image}"
        alt="${product.name}"
        width="800"
        height="800"
        loading="lazy"
        decoding="async">

</a>

           <h3>
    <a
        href="product-details.html?id=${product.id}"
        class="product-title-link">

        ${product.name}

    </a>
</h3>

            <p class="rating">
                ⭐ ${product.rating || 0}
                (${product.reviews || 0} Reviews)
            </p>

            <p class="price">
                ৳${Number(
                    product.price || 0
                ).toLocaleString("en-BD")}
            </p>

            <div class="product-actions">

                <button
                    type="button"
                    class="wishlist-btn ${
                        isWishlisted
                            ? "active"
                            : ""
                    }"
                    data-product-id="${product.id}"
                    aria-pressed="${isWishlisted}"
                    aria-label="${
                        isWishlisted
                            ? `Remove ${product.name} from Wishlist`
                            : `Add ${product.name} to Wishlist`
                    }">

                    ${
                        isWishlisted
                            ? "♥"
                            : "♡"
                    }

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

        productGrid.appendChild(
            productCard
        );
    });
}


/* =================================
   Product Search & Category Filter
================================= */

function filterProducts() {
    if (typeof products === "undefined") {
        return [];
    }

    const searchTerm =
        productSearch
            ? productSearch
                .value
                .trim()
                .toLowerCase()
            : "";

    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "all";

    return products.filter(
        (product) => {
            const productName =
                String(
                    product.name || ""
                ).toLowerCase();

            const productCategory =
                String(
                    product.category || ""
                ).toLowerCase();

            const productSku =
                String(
                    product.sku || ""
                ).toLowerCase();

            const matchesSearch =
                !searchTerm ||
                productName.includes(
                    searchTerm
                ) ||
                productCategory.includes(
                    searchTerm
                ) ||
                productSku.includes(
                    searchTerm
                );

            const matchesCategory =
                selectedCategory === "all" ||
                String(product.category) ===
                    selectedCategory;

            return (
                matchesSearch &&
                matchesCategory
            );
        }
    );
}

function updateFilterStatus(
    resultCount
) {
    if (!searchStatus) return;

    const searchTerm =
        productSearch
            ? productSearch.value.trim()
            : "";

    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "all";

    if (
        !searchTerm &&
        selectedCategory === "all"
    ) {
        searchStatus.textContent = "";
        return;
    }

    if (resultCount === 0) {
        searchStatus.textContent =
            "No products found for the selected filters.";

        return;
    }

    searchStatus.textContent =
        `${resultCount} product${
            resultCount === 1
                ? ""
                : "s"
        } found.`;
}

function applyProductFilters() {
    if (typeof products === "undefined") {
        console.error(
            "products is not defined. Check that products.js loads before main.js."
        );

        return;
    }

    const filteredProducts =
        filterProducts();

    renderProducts(
        filteredProducts
    );

    updateFilterStatus(
        filteredProducts.length
    );
}


/* =================================
   Search & Filter Events
================================= */

if (productSearch) {
    productSearch.addEventListener(
        "input",
        applyProductFilters
    );
}

if (categoryFilter) {
    categoryFilter.addEventListener(
        "change",
        applyProductFilters
    );
}

if (clearFiltersButton) {
    clearFiltersButton.addEventListener(
        "click",
        () => {
            if (productSearch) {
                productSearch.value = "";
            }

            if (categoryFilter) {
                categoryFilter.value =
                    "all";
            }

            applyProductFilters();
        }
    );
}


/* =================================
   Product Grid Events
================================= */

if (productGrid) {
    productGrid.addEventListener(
        "click",
        (event) => {
            const cartButton =
                event.target.closest(
                    ".cart-btn"
                );

            if (!cartButton) return;

            if (cartButton.disabled) {
                return;
            }

            const productId =
                Number(
                    cartButton.dataset.productId
                );

            setButtonLoading(
                cartButton,
                "Adding..."
            );

            addToCart(
                productId
            );

            setButtonSuccess(
                cartButton,
                "✓ Added",
                1000
            );
        }
    );
}

/* =================================
   Initial Product Rendering
================================= */

if (typeof products !== "undefined") {
    renderProducts(products);
} else {
    console.error(
        "Products data not found. Make sure products.js is loaded before main.js."
    );
}


/* =================================
   Skeleton Loading
================================= */

window.addEventListener("load", () => {
    if (skeleton) {
        setTimeout(() => {
            skeleton.classList.add(
                "hide"
            );
        }, 800);
    }

    if (featuredProducts) {
        setTimeout(() => {
            featuredProducts
                .classList
                .remove("hide");
        }, 800);
    }
});







