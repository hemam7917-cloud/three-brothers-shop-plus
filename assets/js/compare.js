"use strict";

/* =================================
   DOM Elements
================================= */

const compareContent =
    document.getElementById(
        "compare-content"
    );

const compareStatus =
    document.getElementById(
        "compare-status"
    );

const clearCompareButton =
    document.getElementById(
        "clear-compare-button"
    );

const compareCount =
    document.getElementById(
        "compare-count"
    );

const cartCount =
    document.getElementById(
        "cart-count"
    );


/* =================================
   Cart Configuration
================================= */

const CART_STORAGE_KEY =
    "tbsp-cart";


/* =================================
   Load Cart
================================= */

function loadCart() {
    return loadStorageArray(
        CART_STORAGE_KEY
    );
}


/* =================================
   Save Cart
================================= */

function saveCart(
    cart
) {
    return saveStorageArray(
        CART_STORAGE_KEY,
        cart
    );
}


/* =================================
   Update Compare Count
================================= */

function updateCompareCount() {
    if (!compareCount) {
        return;
    }

    compareCount.textContent =
        getCompareCount();
}


/* =================================
   Update Cart Count
================================= */

function updateCartCount() {
    if (!cartCount) {
        return;
    }

    const cart =
        loadCart();

    const totalQuantity =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );

    cartCount.textContent =
        totalQuantity;
}


/* =================================
   Get Stock Status
================================= */

function getStockStatus(
    product
) {
    const stock =
        Number(
            product.stock || 0
        );

    if (stock <= 0) {
        return {
            label:
                "Out of Stock",
            className:
                "stock-out"
        };
    }

    if (stock <= 5) {
        return {
            label:
                `Low Stock (${stock})`,
            className:
                "stock-low"
        };
    }

    return {
        label:
            `In Stock (${stock})`,
        className:
            "stock-in"
    };
}


/* =================================
   Add Product To Cart
================================= */

function addCompareProductToCart(
    productId
) {
    const product =
        products.find(
            (item) =>
                String(
                    item.id
                ) ===
                String(
                    productId
                )
        );

    if (!product) {
        alert(
            "Product not found."
        );

        return;
    }

    if (
        Number(
            product.stock || 0
        ) <= 0
    ) {
        alert(
            "This product is currently out of stock."
        );

        return;
    }

    const cart =
        loadCart();

    const existingCartItem =
        cart.find(
            (item) =>
                String(
                    item.id
                ) ===
                String(
                    product.id
                )
        );

    if (
        existingCartItem
    ) {
        existingCartItem.quantity =
            Number(
                existingCartItem
                    .quantity || 0
            ) + 1;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });
    }

    const saved =
        saveCart(
            cart
        );

    if (!saved) {
        alert(
            "Could not add product to cart."
        );

        return;
    }

    updateCartCount();

    alert(
        `${product.name} added to cart.`
    );
}


/* =================================
   Render Empty Compare State
================================= */

function renderEmptyCompare() {
    if (!compareContent) {
        return;
    }

    compareContent.innerHTML = `
        <div class="compare-empty-state">

            <div
                class="compare-empty-icon"
                aria-hidden="true">

                ⚖️

            </div>

            <h2>
                No Products Selected
            </h2>

            <p>
                Select at least two products
                to start comparing.
            </p>

            <a
                href="products.html"
                class="btn btn-primary">

                Browse Products

            </a>

        </div>
    `;
}


/* =================================
   Render Single Product State
================================= */

function renderSingleProductState(
    product
) {
    if (!compareContent) {
        return;
    }

    compareContent.innerHTML = `
        <div class="compare-empty-state">

            <div
                class="compare-empty-icon"
                aria-hidden="true">

                ⚖️

            </div>

            <h2>
                Select One More Product
            </h2>

            <p>
                You selected
                <strong>
                    ${product.name}
                </strong>.
                Add at least one more product
                to start comparison.
            </p>

            <div
                class="compare-empty-actions">

                <a
                    href="products.html"
                    class="btn btn-primary">

                    Add Another Product

                </a>

                <button
                    type="button"
                    class="btn btn-outline"
                    data-action="remove-compare"
                    data-product-id="${product.id}">

                    Remove Selection

                </button>

            </div>

        </div>
    `;
}


/* =================================
   Render Comparison Table
================================= */

function renderComparisonTable(
    compareProducts
) {
    if (!compareContent) {
        return;
    }

    const productHeaders =
        compareProducts
            .map(
                (product) => `
                    <th
                        scope="col"
                        class="compare-product-column">

                        <div
                            class="compare-product-header">

                            <button
                                type="button"
                                class="compare-remove-button"
                                data-action="remove-compare"
                                data-product-id="${product.id}"
                                aria-label="Remove ${product.name} from comparison">

                                ×

                            </button>


                            <a
                                href="product-details.html?id=${
                                    encodeURIComponent(
                                        product.id
                                    )
                                }"
                                class="compare-product-image-link">

                                <img
                                    src="${product.image}"
                                    alt="${product.name}"
                                    width="240"
                                    height="240"
                                    loading="lazy">

                            </a>


                            <h2>

                                <a
                                    href="product-details.html?id=${
                                        encodeURIComponent(
                                            product.id
                                        )
                                    }">

                                    ${product.name}

                                </a>

                            </h2>

                        </div>

                    </th>
                `
            )
            .join("");


    const priceCells =
        compareProducts
            .map(
                (product) => `
                    <td>
                        <strong
                            class="compare-price">

                            ${formatPrice(
                                product.price
                            )}

                        </strong>
                    </td>
                `
            )
            .join("");


    const categoryCells =
        compareProducts
            .map(
                (product) => `
                    <td>
                        ${
                            product.category ||
                            "N/A"
                        }
                    </td>
                `
            )
            .join("");


    const ratingCells =
        compareProducts
            .map(
                (product) => `
                    <td>

                        ⭐ ${
                            product.rating ||
                            0
                        }

                        <small>
                            (${
                                product.reviews ||
                                0
                            } reviews)
                        </small>

                    </td>
                `
            )
            .join("");


    const skuCells =
        compareProducts
            .map(
                (product) => `
                    <td>

                        ${
                            product.sku ||
                            "N/A"
                        }

                    </td>
                `
            )
            .join("");


    const stockCells =
        compareProducts
            .map(
                (product) => {

                    const stockStatus =
                        getStockStatus(
                            product
                        );

                    return `
                        <td>

                            <span
                                class="
                                    compare-stock
                                    ${stockStatus.className}
                                ">

                                ${stockStatus.label}

                            </span>

                        </td>
                    `;
                }
            )
            .join("");


    const actionCells =
        compareProducts
            .map(
                (product) => {

                    const outOfStock =
                        Number(
                            product.stock ||
                            0
                        ) <= 0;

                    return `
                        <td>

                            <div
                                class="compare-product-actions">

                                <a
                                    href="product-details.html?id=${
                                        encodeURIComponent(
                                            product.id
                                        )
                                    }"
                                    class="btn btn-outline">

                                    View Details

                                </a>


                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    data-action="add-cart"
                                    data-product-id="${product.id}"
                                    ${
                                        outOfStock
                                            ? "disabled"
                                            : ""
                                    }>

                                    ${
                                        outOfStock
                                            ? "Out of Stock"
                                            : "Add to Cart"
                                    }

                                </button>

                            </div>

                        </td>
                    `;
                }
            )
            .join("");


    compareContent.innerHTML = `
        <div
            class="compare-table-wrapper">

            <table
                class="compare-table">

                <thead>

                    <tr>

                        <th
                            scope="col"
                            class="compare-feature-heading">

                            Product

                        </th>

                        ${productHeaders}

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <th scope="row">
                            Price
                        </th>

                        ${priceCells}

                    </tr>


                    <tr>

                        <th scope="row">
                            Category
                        </th>

                        ${categoryCells}

                    </tr>


                    <tr>

                        <th scope="row">
                            Rating
                        </th>

                        ${ratingCells}

                    </tr>


                    <tr>

                        <th scope="row">
                            SKU
                        </th>

                        ${skuCells}

                    </tr>


                    <tr>

                        <th scope="row">
                            Stock
                        </th>

                        ${stockCells}

                    </tr>


                    <tr>

                        <th scope="row">
                            Actions
                        </th>

                        ${actionCells}

                    </tr>

                </tbody>

            </table>

        </div>
    `;
}


/* =================================
   Render Compare Page
================================= */

function renderComparePage() {
    if (
        typeof products ===
        "undefined"
    ) {
        return;
    }

    const compareProducts =
        getCompareProductData(
            products
        );

    updateCompareCount();

    if (
        compareStatus
    ) {
        compareStatus.textContent =
            `${compareProducts.length} of ${MAX_COMPARE_PRODUCTS} products selected.`;
    }

    if (
        clearCompareButton
    ) {
        clearCompareButton.disabled =
            compareProducts.length ===
            0;
    }

    if (
        compareProducts.length ===
        0
    ) {
        renderEmptyCompare();

        return;
    }

    if (
        compareProducts.length ===
        1
    ) {
        renderSingleProductState(
            compareProducts[0]
        );

        return;
    }

    renderComparisonTable(
        compareProducts
    );
}


/* =================================
   Compare Content Events
================================= */

if (compareContent) {

    compareContent.addEventListener(
        "click",
        (event) => {

            const actionButton =
                event.target.closest(
                    "[data-action]"
                );

            if (!actionButton) {
                return;
            }

            const action =
                actionButton
                    .dataset
                    .action;

            const productId =
                actionButton
                    .dataset
                    .productId;


            if (
                action ===
                "remove-compare"
            ) {
                removeProductFromCompare(
                    productId
                );

                renderComparePage();

                return;
            }


            if (
                action ===
                "add-cart"
            ) {
                addCompareProductToCart(
                    productId
                );
            }

        }
    );
}


/* =================================
   Clear All Compare Products
================================= */

if (
    clearCompareButton
) {
    clearCompareButton
        .addEventListener(
            "click",
            () => {

                const compareProducts =
                    loadCompareProducts();

                if (
                    compareProducts.length ===
                    0
                ) {
                    return;
                }

                const confirmed =
                    window.confirm(
                        "Remove all products from comparison?"
                    );

                if (!confirmed) {
                    return;
                }

                clearCompareProducts();

                renderComparePage();

            }
        );
}


/* =================================
   Refresh After Back Navigation
================================= */

window.addEventListener(
    "pageshow",
    () => {

        updateCartCount();

        renderComparePage();

    }
);


/* =================================
   Initialize
================================= */

updateCartCount();

renderComparePage();