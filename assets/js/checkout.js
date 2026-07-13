"use strict";

/* =================================
   Checkout Configuration
================================= */

const CART_STORAGE_KEY = "tbsp-cart";

/* =================================
   DOM Elements
================================= */

const checkoutForm =
    document.getElementById("checkout-form");

const checkoutContent =
    document.getElementById("checkout-content");

const checkoutEmpty =
    document.getElementById("checkout-empty");

const checkoutSummary =
    document.getElementById("checkout-summary");

/* =================================
   Load Cart
================================= */

function loadCart() {
    try {
        const savedCart =
            localStorage.getItem(CART_STORAGE_KEY);

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
            "Failed to load checkout cart:",
            error
        );

        return [];
    }
}

const cart = loadCart();

/* =================================
   Helpers
================================= */

function formatPrice(amount) {
    return `৳${Number(amount).toLocaleString("en-BD")}`;
}

function getTotalQuantity() {
    return cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );
}

function getSubtotal() {
    return cart.reduce(
        (total, item) => {
            return (
                total +
                Number(item.price || 0) *
                Number(item.quantity || 0)
            );
        },
        0
    );
}

/* =================================
   Empty Checkout
================================= */

function renderEmptyCheckout() {

    if (!checkoutContent || !checkoutEmpty) {
        return;
    }

    checkoutContent.hidden = true;
    checkoutEmpty.hidden = false;

    checkoutEmpty.innerHTML = `
        <div class="empty-cart">

            <div class="empty-cart-icon">
                🛒
            </div>

            <h2>Your Cart Is Empty</h2>

            <p>
                Add products before proceeding
                to checkout.
            </p>

            <a
                href="index.html#featured-products"
                class="btn btn-primary">

                Continue Shopping

            </a>

        </div>
    `;
}

/* =================================
   Render Checkout Summary
================================= */

function renderCheckoutSummary() {

    if (!checkoutSummary) return;

    const totalItems = getTotalQuantity();
    const subtotal = getSubtotal();

    const shippingCharge =
        subtotal >= 1000
            ? 0
            : 60;

    const grandTotal =
        subtotal + shippingCharge;

    const productsHTML = cart
        .map((product) => {

            const quantity =
                Number(product.quantity || 0);

            const price =
                Number(product.price || 0);

            return `
                <div class="checkout-summary-item">

                    <div>

                        <strong>
                            ${product.name}
                        </strong>

                        <p>
                            ${quantity} ×
                            ${formatPrice(price)}
                        </p>

                    </div>

                    <strong>
                        ${formatPrice(
                            price * quantity
                        )}
                    </strong>

                </div>
            `;
        })
        .join("");

    checkoutSummary.innerHTML = `
        <div class="checkout-card checkout-summary-card">

            <h2>Order Summary</h2>

            <div class="checkout-products">
                ${productsHTML}
            </div>

            <div class="summary-row">

                <span>Total Items</span>

                <strong>
                    ${totalItems}
                </strong>

            </div>

            <div class="summary-row">

                <span>Subtotal</span>

                <strong>
                    ${formatPrice(subtotal)}
                </strong>

            </div>

            <div class="summary-row">

                <span>Shipping</span>

                <strong>
                    ${
                        shippingCharge === 0
                            ? "FREE"
                            : formatPrice(
                                shippingCharge
                            )
                    }
                </strong>

            </div>

            <div class="summary-row summary-total">

                <span>Total</span>

                <strong>
                    ${formatPrice(grandTotal)}
                </strong>

            </div>

        </div>
    `;
}

/* =================================
   Checkout Form
================================= */

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            if (cart.length === 0) {
                return;
            }

            console.log(
                "Checkout form submitted."
            );
        }
    );
}

/* =================================
   Initialize Checkout
================================= */

if (cart.length === 0) {
    renderEmptyCheckout();
} else {
    renderCheckoutSummary();
}