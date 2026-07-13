"use strict";

/* =================================
   Storage Configuration
================================= */

const CART_STORAGE_KEY =
    "tbsp-cart";

const WISHLIST_STORAGE_KEY =
    "tbsp-wishlist";

/* =================================
   DOM Element
================================= */

const productDetailsContainer =
    document.getElementById(
        "product-details"
    );

/* =================================
   Generic Storage Loader
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

/* =================================
   Read Product ID From URL
================================= */

function getProductIdFromUrl() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return Number(
        params.get("id")
    );
}

/* =================================
   Find Product
================================= */

function findProductById(
    productId
) {
    if (
        typeof products ===
        "undefined"
    ) {
        return null;
    }

    return products.find(
        (product) =>
            product.id === productId
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
   Wishlist Check
================================= */

function isProductWishlisted(
    productId
) {
    const wishlist =
        loadStorageArray(
            WISHLIST_STORAGE_KEY
        );

    return wishlist.some(
        (item) =>
            item.id === productId
    );
}

/* =================================
   Add To Cart
================================= */

function addProductToCart(
    product
) {
    const cart =
        loadStorageArray(
            CART_STORAGE_KEY
        );

    const existingCartItem =
        cart.find(
            (item) =>
                item.id === product.id
        );

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );
}

/* =================================
   Toggle Wishlist
================================= */

function toggleProductWishlist(
    product
) {
    let wishlist =
        loadStorageArray(
            WISHLIST_STORAGE_KEY
        );

    const exists =
        wishlist.some(
            (item) =>
                item.id === product.id
        );

    if (exists) {
        wishlist =
            wishlist.filter(
                (item) =>
                    item.id !== product.id
            );
    } else {
        wishlist.push({
            ...product
        });
    }

    localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlist)
    );
}

/* =================================
   Render Missing Product
================================= */

function renderMissingProduct() {
    if (!productDetailsContainer) {
        return;
    }

    productDetailsContainer.innerHTML = `
        <div class="product-empty-state">

            <div
                class="product-empty-icon"
                aria-hidden="true">
                ⚠️
            </div>

            <h1>
                Product Not Found
            </h1>

            <p>
                The requested product
                could not be found.
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
   Render Product Details
================================= */

function renderProductDetails(
    product
) {
    if (!productDetailsContainer) {
        return;
    }

    const wishlisted =
        isProductWishlisted(
            product.id
        );

    productDetailsContainer.innerHTML = `
        <article class="product-details-card">

            <div class="product-details-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    width="800"
                    height="800">

            </div>

            <div class="product-details-content">

                <span class="product-badge">
                    ${product.badge || ""}
                </span>

                <p class="product-details-category">
                    ${product.category}
                </p>

                <h1>
                    ${product.name}
                </h1>

                <p class="rating">
                    ⭐ ${product.rating}
                    (${product.reviews} Reviews)
                </p>

                <p class="product-details-price">
                    ${formatPrice(
                        product.price
                    )}
                </p>

                <p class="product-details-stock">
                    ${
                        product.stock > 0
                            ? `${product.stock} items in stock`
                            : "Out of stock"
                    }
                </p>

                <p class="product-details-description">
                    Fresh, trusted and carefully selected
                    ${product.name.toLowerCase()}
                    from Three Brothers Shop Plus.
                </p>

                <div class="product-details-meta">

                    <p>
                        <strong>SKU:</strong>
                        ${product.sku}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${product.category}
                    </p>

                </div>

                <div class="product-details-actions">

                    <button
                        type="button"
                        id="details-wishlist-btn"
                        class="btn btn-outline">

                        ${
                            wishlisted
                                ? "♥ Remove from Wishlist"
                                : "♡ Add to Wishlist"
                        }

                    </button>

                    <button
                        type="button"
                        id="details-cart-btn"
                        class="btn btn-primary"
                        ${
                            product.stock <= 0
                                ? "disabled"
                                : ""
                        }>

                        🛒 Add to Cart

                    </button>

                </div>

                <p
                    id="product-details-status"
                    class="product-details-status"
                    aria-live="polite">
                </p>

            </div>

        </article>
    `;

    setupProductDetailsEvents(
        product
    );
}

/* =================================
   Product Detail Events
================================= */

function setupProductDetailsEvents(
    product
) {
    const cartButton =
        document.getElementById(
            "details-cart-btn"
        );

    const wishlistButton =
        document.getElementById(
            "details-wishlist-btn"
        );

    const status =
        document.getElementById(
            "product-details-status"
        );

    if (cartButton) {
        cartButton.addEventListener(
            "click",
            () => {
                addProductToCart(
                    product
                );

                if (status) {
                    status.textContent =
                        `${product.name} added to cart.`;
                }
            }
        );
    }

    if (wishlistButton) {
        wishlistButton.addEventListener(
            "click",
            () => {
                toggleProductWishlist(
                    product
                );

                renderProductDetails(
                    product
                );
            }
        );
    }
}

/* =================================
   Initialize
================================= */

const productId =
    getProductIdFromUrl();

const selectedProduct =
    findProductById(
        productId
    );

if (!selectedProduct) {
    renderMissingProduct();
} else {
    renderProductDetails(
        selectedProduct
    );
}