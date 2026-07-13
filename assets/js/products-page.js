"use strict";

/* =================================
   Storage Configuration
================================= */

const CART_STORAGE_KEY =
    "tbsp-cart";

const WISHLIST_STORAGE_KEY =
    "tbsp-wishlist";


/* =================================
   DOM Elements
================================= */

const catalogGrid =
    document.getElementById(
        "catalog-grid"
    );

const catalogSearch =
    document.getElementById(
        "catalog-search"
    );

const catalogCategory =
    document.getElementById(
        "catalog-category"
    );

const catalogSort =
    document.getElementById(
        "catalog-sort"
    );

const catalogClear =
    document.getElementById(
        "catalog-clear"
    );

const catalogStatus =
    document.getElementById(
        "catalog-status"
    );

const cartCount =
    document.getElementById(
        "cart-count"
    );

const wishlistCount =
    document.getElementById(
        "wishlist-count"
    );


/* =================================
   Storage Helpers
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


function saveStorageArray(
    key,
    data
) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            `Failed to save ${key}:`,
            error
        );
    }
}


/* =================================
   State
================================= */

let cart =
    loadStorageArray(
        CART_STORAGE_KEY
    );

let wishlist =
    loadStorageArray(
        WISHLIST_STORAGE_KEY
    );


/* =================================
   Header Counters
================================= */

function updateCartCount() {
    if (!cartCount) return;

    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );

    cartCount.textContent =
        totalQuantity;
}


function updateWishlistCount() {
    if (!wishlistCount) return;

    wishlistCount.textContent =
        wishlist.length;
}


/* =================================
   Wishlist Helper
================================= */

function isProductInWishlist(
    productId
) {
    return wishlist.some(
        (item) =>
            item.id === productId
    );
}


/* =================================
   Add To Cart
================================= */

function addToCart(productId) {
    const product =
        products.find(
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

    saveStorageArray(
        CART_STORAGE_KEY,
        cart
    );

    updateCartCount();
}


/* =================================
   Toggle Wishlist
================================= */

function toggleWishlist(
    productId
) {
    const product =
        products.find(
            (item) =>
                item.id === productId
        );

    if (!product) return;

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
    } else {
        wishlist.push({
            ...product
        });
    }

    saveStorageArray(
        WISHLIST_STORAGE_KEY,
        wishlist
    );

    updateWishlistCount();

    applyCatalogFilters();
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
   Render Products
================================= */

function renderCatalog(
    productList
) {
    if (!catalogGrid) return;

    catalogGrid.innerHTML = "";

    if (
        !Array.isArray(productList) ||
        productList.length === 0
    ) {
        catalogGrid.innerHTML = `
            <div class="product-empty-state">

                <div
                    class="product-empty-icon"
                    aria-hidden="true">
                    🔍
                </div>

                <h2>
                    No Products Found
                </h2>

                <p>
                    Try changing your search,
                    category or sort option.
                </p>

            </div>
        `;

        return;
    }

    catalogGrid.innerHTML =
        productList
            .map((product) => {

                const wishlisted =
                    isProductInWishlist(
                        product.id
                    );

                return `
                    <article
                        class="product-card"
                        data-product-id="${product.id}">

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
                                class="wishlist-btn ${
                                    wishlisted
                                        ? "active"
                                        : ""
                                }"
                                data-action="wishlist"
                                data-product-id="${product.id}"
                                aria-pressed="${wishlisted}">

                                ${
                                    wishlisted
                                        ? "♥"
                                        : "♡"
                                }

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
                `;
            })
            .join("");
}


/* =================================
   Filter Products
================================= */

function getFilteredProducts() {
    const searchTerm =
        catalogSearch
            ? catalogSearch
                .value
                .trim()
                .toLowerCase()
            : "";

    const selectedCategory =
        catalogCategory
            ? catalogCategory.value
            : "all";

    let filteredProducts =
        products.filter(
            (product) => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();

                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();

                const sku =
                    String(
                        product.sku || ""
                    ).toLowerCase();

                const matchesSearch =
                    !searchTerm ||
                    name.includes(
                        searchTerm
                    ) ||
                    category.includes(
                        searchTerm
                    ) ||
                    sku.includes(
                        searchTerm
                    );

                const matchesCategory =
                    selectedCategory ===
                        "all" ||
                    product.category ===
                        selectedCategory;

                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );

    return filteredProducts;
}


/* =================================
   Sort Products
================================= */

function sortProducts(
    productList
) {
    const sortValue =
        catalogSort
            ? catalogSort.value
            : "default";

    const sortedProducts =
        [...productList];

    if (
        sortValue ===
        "price-low-high"
    ) {
        sortedProducts.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );
    }

    if (
        sortValue ===
        "price-high-low"
    ) {
        sortedProducts.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );
    }

    if (
        sortValue ===
        "rating-high-low"
    ) {
        sortedProducts.sort(
            (a, b) =>
                Number(b.rating) -
                Number(a.rating)
        );
    }

    if (
        sortValue ===
        "name-a-z"
    ) {
        sortedProducts.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );
    }

    return sortedProducts;
}


/* =================================
   Status Message
================================= */

function updateCatalogStatus(
    resultCount
) {
    if (!catalogStatus) return;

    if (
        resultCount ===
        products.length
    ) {
        catalogStatus.textContent =
            `${resultCount} products available.`;

        return;
    }

    if (resultCount === 0) {
        catalogStatus.textContent =
            "No products match your current filters.";

        return;
    }

    catalogStatus.textContent =
        `${resultCount} product${
            resultCount === 1
                ? ""
                : "s"
        } found.`;
}


/* =================================
   Apply Filters & Sorting
================================= */

function applyCatalogFilters() {
    const filteredProducts =
        getFilteredProducts();

    const sortedProducts =
        sortProducts(
            filteredProducts
        );

    renderCatalog(
        sortedProducts
    );

    updateCatalogStatus(
        sortedProducts.length
    );
}


/* =================================
   Control Events
================================= */

if (catalogSearch) {
    catalogSearch.addEventListener(
        "input",
        applyCatalogFilters
    );
}

if (catalogCategory) {
    catalogCategory.addEventListener(
        "change",
        applyCatalogFilters
    );
}

if (catalogSort) {
    catalogSort.addEventListener(
        "change",
        applyCatalogFilters
    );
}

if (catalogClear) {
    catalogClear.addEventListener(
        "click",
        () => {

            if (catalogSearch) {
                catalogSearch.value = "";
            }

            if (catalogCategory) {
                catalogCategory.value =
                    "all";
            }

            if (catalogSort) {
                catalogSort.value =
                    "default";
            }

            applyCatalogFilters();
        }
    );
}


/* =================================
   Product Grid Events
================================= */

if (catalogGrid) {
    catalogGrid.addEventListener(
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

            if (
                action === "cart"
            ) {
                addToCart(
                    productId
                );
            }

            if (
                action === "wishlist"
            ) {
                toggleWishlist(
                    productId
                );
            }
        }
    );
}


/* =================================
   Initialize
================================= */

updateCartCount();
updateWishlistCount();

applyCatalogFilters();