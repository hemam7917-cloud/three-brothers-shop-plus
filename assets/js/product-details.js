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

    const recentlyViewedSection =
    document.getElementById(
        "recently-viewed-section"
    );

const recentlyViewedGrid =
    document.getElementById(
        "recently-viewed-grid"
    );

    const relatedProductsSection =
    document.getElementById(
        "related-products-section"
    );

const relatedProductsGrid =
    document.getElementById(
        "related-products-grid"
    );

/* =================================
   Generic Storage Loader
================================= */



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

    showToast(
        `${product.name} added to cart.`,
        "success"
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

        showToast(
            `${product.name} removed from wishlist.`,
            "info"
        );
    } else {
        wishlist.push({
            ...product
        });

        showToast(
            `${product.name} added to wishlist.`,
            "success"
        );
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
   Product Details Dynamic Events
================================= */

const wishlistButton =
    productDetailsContainer.querySelector(
        ".wishlist-btn"
    );

if (wishlistButton) {
    wishlistButton.addEventListener(
        "click",
        () => {
            toggleWishlist(
                product.id
            );

            const isWishlisted =
                isProductInWishlist(
                    product.id
                );

            wishlistButton.classList.toggle(
                "active",
                isWishlisted
            );

            wishlistButton.textContent =
                isWishlisted
                    ? "♥"
                    : "♡";

            wishlistButton.setAttribute(
                "aria-label",
                isWishlisted
                    ? `Remove ${product.name} from Wishlist`
                    : `Add ${product.name} to Wishlist`
            );
        }
    );
}


/* =================================
   Render Recently Viewed Products
================================= */

function renderRecentlyViewedProducts(
    currentProductId
) {
    if (
        !recentlyViewedSection ||
        !recentlyViewedGrid
    ) {
        return;
    }

    const recentlyViewed =
        loadRecentlyViewed();

    const filteredProducts =
        recentlyViewed.filter(
            (product) =>
                String(product.id) !==
                String(currentProductId)
        );

    if (
        filteredProducts.length === 0
    ) {
        recentlyViewedSection.hidden =
            true;

        recentlyViewedGrid.innerHTML =
            "";

        return;
    }

    recentlyViewedSection.hidden =
        false;

    recentlyViewedGrid.innerHTML =
        filteredProducts
            .slice(0, 4)
            .map(
                (product) => `
                    <article
                        class="product-card"
                        data-product-id="${product.id}">

                        ${
                            product.badge
                                ? `
                                    <span
                                        class="product-badge">

                                        ${product.badge}

                                    </span>
                                `
                                : ""
                        }

                        <a
                            href="product-details.html?id=${
                                encodeURIComponent(
                                    product.id
                                )
                            }"
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
                                href="product-details.html?id=${
                                    encodeURIComponent(
                                        product.id
                                    )
                                }"
                                class="product-title-link">

                                ${product.name}

                            </a>

                        </h3>

                        <p class="rating">

                            ⭐ ${
                                product.rating || 0
                            }

                            (${
                                product.reviews || 0
                            } Reviews)

                        </p>

                        <p class="price">

                            ${formatPrice(
                                product.price
                            )}

                        </p>

                        <div class="product-actions">

                            <button
                                type="button"
                                class="recent-cart-btn cart-btn"
                                data-action="recent-add-cart"
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
        addToCartButton.addEventListener(
    "click",
    () => {
        if (
            addToCartButton.disabled
        ) {
            return;
        }

        setButtonLoading(
            addToCartButton,
            "Adding..."
        );

        addProductToCart(
            selectedProduct
        );

        setButtonSuccess(
            addToCartButton,
            "✓ Added to Cart",
            1200
        );
    }
);

                if (status) {
                    status.textContent =
                        `${product.name} added to cart.`;
                }
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

    /*
       Show previously viewed
       products first.
    */

    renderRecentlyViewedProducts(
        selectedProduct.id
    );

    /*
       Render related
       recommendations.
    */

    renderRelatedProducts(
        selectedProduct
    );

    /*
       Save current product
       to recently viewed.
    */

    addRecentlyViewedProduct(
        selectedProduct
    );

    /*
       Render current
       product details.
    */

    renderProductDetails(
        selectedProduct
    );
}

/* =================================
   Add Recently Viewed Product To Cart
================================= */

function addRecentlyViewedToCart(
    productId
) {
    if (
        typeof products ===
        "undefined"
    ) {
        return;
    }

    const product =
        products.find(
            (item) =>
                String(item.id) ===
                String(productId)
        );

    if (!product) {
        showToast(
            "Product not found.",
            "error"
        );

        return;
    }

    addProductToCart(
        product
    );
}


/* =================================
   Recently Viewed Events
================================= */

if (
    recentlyViewedGrid
) {
    recentlyViewedGrid.addEventListener(
        "click",
        (event) => {

            const actionButton =
                event.target.closest(
                    '[data-action="recent-add-cart"]'
                );

            if (!actionButton) {
                return;
            }

            const productId =
                actionButton
                    .dataset
                    .productId;

            addRecentlyViewedToCart(
                productId
            );
        }
    );
}

/* =================================
   Product Card HTML
================================= */

function createRecommendationCardHTML(
    product
) {
    const wishlisted =
        isProductWishlisted(
            product.id
        );

    return `
        <article
            class="product-card"
            data-product-id="${product.id}">

            ${
                product.badge
                    ? `
                        <span
                            class="product-badge">

                            ${product.badge}

                        </span>
                    `
                    : ""
            }

            <a
                href="product-details.html?id=${
                    encodeURIComponent(
                        product.id
                    )
                }"
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
                    href="product-details.html?id=${
                        encodeURIComponent(
                            product.id
                        )
                    }"
                    class="product-title-link">

                    ${product.name}

                </a>

            </h3>

            <p class="rating">

                ⭐ ${
                    product.rating || 0
                }

                (${
                    product.reviews || 0
                } Reviews)

            </p>

            <p class="price">

                ${formatPrice(
                    product.price
                )}

            </p>

            <div class="product-actions">

                <button
                    type="button"
                    class="
                        wishlist-btn
                        ${
                            wishlisted
                                ? "active"
                                : ""
                        }
                    "
                    data-action="recommendation-wishlist"
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
                    data-action="recommendation-cart"
                    data-product-id="${product.id}">

                    🛒 Add to Cart

                </button>

            </div>

        </article>
    `;
}

/* =================================
   Render Related Products
================================= */

function renderRelatedProducts(
    currentProduct
) {
    if (
        !relatedProductsSection ||
        !relatedProductsGrid ||
        typeof products ===
            "undefined"
    ) {
        return;
    }

    const recentlyViewed =
        loadRecentlyViewed();

    const recommendedProducts =
        getRecommendedProducts(
            products,
            currentProduct,
            recentlyViewed,
            4
        );

    if (
        recommendedProducts.length ===
        0
    ) {
        relatedProductsSection.hidden =
            true;

        relatedProductsGrid.innerHTML =
            "";

        return;
    }

    relatedProductsSection.hidden =
        false;

    relatedProductsGrid.innerHTML =
        recommendedProducts
            .map(
                (product) =>
                    createRecommendationCardHTML(
                        product
                    )
            )
            .join("");
}


/* =================================
   Related Products Events
================================= */

if (
    relatedProductsGrid
) {
    relatedProductsGrid.addEventListener(
        "click",
        (event) => {

            const actionButton =
                event.target.closest(
                    "[data-action]"
                );

            if (!actionButton) {
                return;
            }

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

            const product =
                products.find(
                    (item) =>
                        Number(
                            item.id
                        ) ===
                        productId
                );

            if (!product) {
                showToast(
                    "Product not found.",
                    "error"
                );

                return;
            }

            if (
                action ===
                "recommendation-cart"
            ) {
                addProductToCart(
                    product
                );
            }

            if (
                action ===
                "recommendation-wishlist"
            ) {
                toggleProductWishlist(
                    product
                );

                renderRelatedProducts(
                    selectedProduct
                );
            }
        }
    );
}
