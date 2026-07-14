
/* =================================
   Cart Storage Configuration
================================= */

const CART_STORAGE_KEY = "tbsp-cart";

/* =================================
   DOM Elements
================================= */

const cartItemsContainer = document.getElementById("cart-items");
const cartSummaryContainer = document.getElementById("cart-summary");
const cartCount = document.getElementById("cart-count");

/* =================================
   Load Cart
================================= */

function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCart) {
            return [];
        }

        const parsedCart = JSON.parse(savedCart);

        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        console.error("Failed to load cart:", error);
        return [];
    }
}

let cart =
    loadStorageArray(
        CART_STORAGE_KEY
    );
/* =================================
   Save Cart
================================= */
function saveCart() {
    saveStorageArray(
        CART_STORAGE_KEY,
        cart
    );
}

/* =================================
   Cart Counter
================================= */

function getTotalQuantity() {
    return cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );
}

function updateCartCount() {
    if (!cartCount) return;

    cartCount.textContent = getTotalQuantity();
}

/* =================================
   Cart Total
================================= */

function getCartSubtotal() {
    return cart.reduce(
        (total, item) => {
            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 0);

            return total + price * quantity;
        },
        0
    );
}

/* =================================
   Currency Formatting
================================= 


/* =================================
   Toast Notification
================================= */


/* =================================
   Increase Quantity
================================= */

function increaseQuantity(productId) {
    const cartItem = cart.find(
        (item) => item.id === productId
    );

    if (!cartItem) return;

    cartItem.quantity += 1;

    saveCart();
    renderCart();
}

/* =================================
   Decrease Quantity
================================= */

function decreaseQuantity(productId) {
    const cartItem = cart.find(
        (item) => item.id === productId
    );

    if (!cartItem) return;

    if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
    } else {
        cart = cart.filter(
            (item) => item.id !== productId
        );
    }

    saveCart();
    renderCart();
}

/* =================================
   Remove Cart Item
================================= */

function removeCartItem(productId) {
    const cartItem = cart.find(
        (item) => item.id === productId
    );

    if (!cartItem) return;

    const confirmed = window.confirm(
        `Remove "${cartItem.name}" from your cart?`
    );

    if (!confirmed) return;

    cart = cart.filter(
        (item) => item.id !== productId
    );

    saveCart();
    renderCart();

    showToast(`${cartItem.name} removed from cart.`);
}


/* =================================
   Clear Entire Cart
================================= */

function clearCart() {
    if (cart.length === 0) return;

    const confirmed = window.confirm(
        "Are you sure you want to remove all products from your cart?"
    );

    if (!confirmed) return;

    cart = [];

    saveCart();
    renderCart();

    showToast("Your cart has been cleared.");
}

/* =================================
   Empty Cart
================================= */

function renderEmptyCart() {
    if (!cartItemsContainer || !cartSummaryContainer) {
        return;
    }

    cartItemsContainer.innerHTML = `
        <div class="empty-cart">

            <div
                class="empty-cart-icon"
                aria-hidden="true">
                🛒
            </div>

            <h2>Your Cart Is Empty</h2>

            <p>
                Add some products before continuing to checkout.
            </p>

            <a
                href="index.html#featured-products"
                class="btn btn-primary">
                Continue Shopping
            </a>

        </div>
    `;

    cartSummaryContainer.innerHTML = "";
}

/* =================================
   Render Cart Items
================================= */

function renderCartItems() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = cart
        .map((product) => {
            const price = Number(product.price || 0);
            const quantity = Number(product.quantity || 0);
            const subtotal = price * quantity;

            return `
                <article
                    class="cart-item"
                    data-product-id="${product.id}">

                    <div class="cart-item-image">

                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            width="120"
                            height="120"
                            loading="lazy"
                            decoding="async">

                    </div>

                    <div class="cart-item-info">

                        <h2>${product.name}</h2>

                        <p class="cart-item-price">
                            ${formatPrice(price)}
                        </p>

                        <div class="cart-item-controls">

                            <div class="quantity-control">

                                <button
                                    type="button"
                                    class="quantity-btn"
                                    data-action="decrease"
                                    data-product-id="${product.id}"
                                    aria-label="Decrease quantity of ${product.name}">
                                    −
                                </button>

                                <span class="quantity-value">
                                    ${quantity}
                                </span>

                                <button
                                    type="button"
                                    class="quantity-btn"
                                    data-action="increase"
                                    data-product-id="${product.id}"
                                    aria-label="Increase quantity of ${product.name}">
                                    +
                                </button>

                            </div>

                            <button
                                type="button"
                                class="remove-cart-btn"
                                data-action="remove"
                                data-product-id="${product.id}">
                                Remove
                            </button>

                        </div>

                        <p class="cart-item-meta">
                            Subtotal:
                            <strong>
                                ${formatPrice(subtotal)}
                            </strong>
                        </p>

                    </div>

                </article>
            `;
        })
        .join("");
}

/* =================================
   Render Order Summary
================================= */

function renderCartSummary() {
    if (!cartSummaryContainer) return;

    const totalItems = getTotalQuantity();
    const subtotal = getCartSubtotal();

    const shippingCharge =
        subtotal >= 1000 || subtotal === 0
            ? 0
            : 60;

    const grandTotal = subtotal + shippingCharge;

   cartSummaryContainer.innerHTML = `
    <div class="cart-summary-card">

        <h2>Order Summary</h2>

        <div class="summary-row">
            <span>Total Items</span>
            <strong>${totalItems}</strong>
        </div>

        <div class="summary-row">
            <span>Subtotal</span>
            <strong>${formatPrice(subtotal)}</strong>
        </div>

        <div class="summary-row">
            <span>Shipping</span>

            <strong>
                ${
                    shippingCharge === 0
                        ? "FREE"
                        : formatPrice(shippingCharge)
                }
            </strong>
        </div>

        <div class="summary-row summary-total">
            <span>Total</span>
            <strong>${formatPrice(grandTotal)}</strong>
        </div>

        <button
            type="button"
            class="clear-cart-btn"
            id="clear-cart-btn">
            Clear Cart
        </button>

        <a
            href="checkout.html"
            class="btn btn-primary checkout-btn">
            Proceed to Checkout
        </a>

    </div>
`;}

/* =================================
   Main Render
================================= */

function renderCart() {
    if (!cartItemsContainer || !cartSummaryContainer) {
        return;
    }

    updateCartCount();

    if (cart.length === 0) {
        renderEmptyCart();
        return;
    }

    renderCartItems();
    renderCartSummary();
}

/* =================================
   Cart Event Delegation
================================= */

if (cartItemsContainer) {
    cartItemsContainer.addEventListener(
        "click",
        (event) => {
            const actionButton = event.target.closest(
                "[data-action]"
            );

            if (!actionButton) return;

            const productId = Number(
                actionButton.dataset.productId
            );

            const action =
                actionButton.dataset.action;

            if (action === "increase") {
                increaseQuantity(productId);
            }

            if (action === "decrease") {
                decreaseQuantity(productId);
            }

            if (action === "remove") {
                removeCartItem(productId);
            }
        }
    );
}

/* =================================
   Order Summary Events
================================= */

if (cartSummaryContainer) {
    cartSummaryContainer.addEventListener(
        "click",
        (event) => {
            const clearCartButton = event.target.closest(
                "#clear-cart-btn"
            );

            if (!clearCartButton) return;

            clearCart();
        }
    );
}

/* =================================
   Initialize
================================= */

renderCart();
