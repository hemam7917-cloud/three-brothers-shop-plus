"use strict";

/* =================================
   Storage Configuration
================================= */

const WISHLIST_STORAGE_KEY =
    "tbsp-wishlist";

const CART_STORAGE_KEY =
    "tbsp-cart";

/* =================================
   DOM Elements
================================= */

const wishlistGrid =
    document.getElementById(
        "wishlist-grid"
    );

/* =================================
   Load Storage Array
================================= */

function loadStorageArray(key) {
    try {
        const savedData =
            localStorage.getItem(key);

        if (!savedData) {
            return [];
        }

        const parsedData =
            JSON.parse(savedData);

        return Array.isArray(parsedData)
            ? parsedData
            : [];

    } catch (error) {

        console.error(
            `Failed to load ${key}:`,
            error
        );

        return [];
    }
}

let wishlist =
    loadStorageArray(
        WISHLIST_STORAGE_KEY
    );

let cart =
    loadStorageArray(
        CART_STORAGE_KEY
    );

/* =================================
   Save Data
================================= */

function saveWishlist() {
    localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlist)
    );
}

function saveCart() {
    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );
}

/* =================================
   Format Price
================================= */

function formatPrice(amount) {
    return `৳${Number(
        amount
    ).toLocaleString("en-BD")}`;
}

/* =================================
   Add To Cart
================================= */

function addToCart(productId) {
    const product =
        wishlist.find(
            (item) =>
                item.id === productId
        );

    if (!product) return;

    const existingCartItem =
        cart.find(
            (item) =>
                item.id === productId
        );

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
}

/* =================================
   Remove Wishlist Item
================================= */

function removeWishlistItem(
    productId
) {
    wishlist =
        wishlist.filter(
            (item) =>
                item.id !== productId
        );

    saveWishlist();

    renderWishlist();
}

/* =================================
   Render Empty Wishlist
================================= */

function renderEmptyWishlist() {
    if (!wishlistGrid) return;

    wishlistGrid.innerHTML = `
        <div class="product-empty-state">

            <div
                class="product-empty-icon"
                aria-hidden="true">
                ♡
            </div>

            <h2>
                Your Wishlist Is Empty
            </h2>

            <p>
                Save products you love
                and find them here later.
            </p>

            <a
                href="index.html#featured-products"
                class="btn btn-primary">

                Browse Products

            </a>

        </div>
    `;
}

/* =================================
   Render Wishlist
================================= */

function renderWishlist() {
    if (!wishlistGrid) return;

    if (wishlist.length === 0) {
        renderEmptyWishlist();

        return;
    }

    wishlistGrid.innerHTML =
        wishlist
            .map(
                (product) => `
                    <article
                        class="product-card"
                        data-product-id="${product.id}">

                        <span
                            class="product-badge">
                            ${product.badge}
                        </span>

                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            width="800"
                            height="800"
                            loading="lazy"
                            decoding="async">

                        <h3>
                            ${product.name}
                        </h3>

                        <p class="rating">
                            ⭐ ${product.rating}
                            (${product.reviews} Reviews)
                        </p>

                        <p class="price">
                            ${formatPrice(
                                product.price
                            )}
                        </p>

                        <div class="product-actions">

                            <button
                                type="button"
                                class="remove-wishlist-btn"
                                data-action="remove"
                                data-product-id="${product.id}">

                                Remove

                            </button>

                            <button
                                type="button"
                                class="cart-btn"
                                data-action="cart"
                                data-product-id="${product.id}">

                                🛒 Add to Cart

                            </button>

                        </div>

                    </article>
                `
            )
            .join("");
}

/* =================================
   Wishlist Events
================================= */

if (wishlistGrid) {
    wishlistGrid.addEventListener(
        "click",
        (event) => {

            const actionButton =
                event.target.closest(
                    "[data-action]"
                );

            if (!actionButton) return;

            const productId =
                Number(
                    actionButton
                        .dataset
                        .productId
                );

            const action =
                actionButton
                    .dataset
                    .action;

            if (action === "remove") {
                removeWishlistItem(
                    productId
                );
            }

            if (action === "cart") {
                addToCart(productId);
            }
        }
    );
}

/* =================================
   Initialize
================================= */

renderWishlist();