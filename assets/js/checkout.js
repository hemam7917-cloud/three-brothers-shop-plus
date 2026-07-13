"use strict";

/* =================================
   Storage Configuration
================================= */

const CART_STORAGE_KEY = "tbsp-cart";
const ORDERS_STORAGE_KEY = "tbsp-orders";

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
   Load Storage Data
================================= */

function loadStorageArray(key) {
    try {
        const savedData = localStorage.getItem(key);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

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

const cart = loadStorageArray(
    CART_STORAGE_KEY
);

/* =================================
   Helper Functions
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
        (total, item) =>
            total +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );
}

function getShippingCharge() {
    const subtotal = getSubtotal();

    return subtotal >= 1000
        ? 0
        : 60;
}

/* =================================
   Bangladesh Phone Validation
================================= */

function isValidBangladeshPhone(phone) {
    const cleanPhone = phone.replace(
        /[\s-]/g,
        ""
    );

    const phonePattern =
        /^(?:\+?88)?01[3-9]\d{8}$/;

    return phonePattern.test(cleanPhone);
}

/* =================================
   Generate Unique Order ID
================================= */

function generateOrderId() {
    const timestamp = Date.now();

    const randomNumber = Math.floor(
        1000 + Math.random() * 9000
    );

    return `TBSP-${timestamp}-${randomNumber}`;
}

/* =================================
   Render Empty Checkout
================================= */

function renderEmptyCheckout() {
    if (!checkoutContent || !checkoutEmpty) {
        return;
    }

    checkoutContent.hidden = true;
    checkoutEmpty.hidden = false;

    checkoutEmpty.innerHTML = `
        <div class="empty-cart">

            <div
                class="empty-cart-icon"
                aria-hidden="true">
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
        getShippingCharge();

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
                <strong>${totalItems}</strong>
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
   Create Order
================================= */

function createOrder(formData) {
    const subtotal = getSubtotal();

    const shippingCharge =
        getShippingCharge();

    const grandTotal =
        subtotal + shippingCharge;

    return {
        id: generateOrderId(),

        customer: {
            fullName:
                formData.get("fullName").trim(),

            phone:
                formData.get("phone").trim(),

            email:
                formData.get("email").trim()
        },

        deliveryAddress: {
            address:
                formData.get("address").trim(),

            district:
                formData.get("district").trim(),

            postalCode:
                formData.get("postalCode").trim()
        },

        paymentMethod:
            formData.get("paymentMethod"),

        items: cart.map((item) => ({
            ...item
        })),

        totals: {
            totalItems: getTotalQuantity(),
            subtotal,
            shippingCharge,
            grandTotal
        },

        status: "pending",

        createdAt:
            new Date().toISOString()
    };
}

/* =================================
   Save Order
================================= */

function saveOrder(order) {
    try {
        const orders =
            loadStorageArray(
                ORDERS_STORAGE_KEY
            );

        orders.push(order);

        localStorage.setItem(
            ORDERS_STORAGE_KEY,
            JSON.stringify(orders)
        );

        return true;

    } catch (error) {

        console.error(
            "Failed to save order:",
            error
        );

        return false;
    }
}

/* =================================
   Clear Cart
================================= */

function clearCart() {
    localStorage.removeItem(
        CART_STORAGE_KEY
    );
}

/* =================================
   Show Order Success
================================= */

function showOrderSuccess(order) {
    if (!checkoutContent || !checkoutEmpty) {
        return;
    }

    checkoutContent.hidden = true;
    checkoutEmpty.hidden = false;

    checkoutEmpty.innerHTML = `
        <div class="empty-cart">

            <div
                class="empty-cart-icon"
                aria-hidden="true">
                ✅
            </div>

            <h2>
                Order Placed Successfully!
            </h2>

            <p>
                Thank you,
                <strong>
                    ${order.customer.fullName}
                </strong>.
            </p>

            <p>
                Your Order ID:
            </p>

            <p>
                <strong>
                    ${order.id}
                </strong>
            </p>

            <p>
                Total:
                <strong>
                    ${formatPrice(
                        order.totals.grandTotal
                    )}
                </strong>
            </p>

            <a
                href="index.html"
                class="btn btn-primary">
                Continue Shopping
            </a>

        </div>
    `;
}

/* =================================
   Checkout Form Submission
================================= */

if (checkoutForm) {
    checkoutForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            if (cart.length === 0) {
                renderEmptyCheckout();
                return;
            }

            if (!checkoutForm.checkValidity()) {
                checkoutForm.reportValidity();
                return;
            }

            const formData =
                new FormData(checkoutForm);

            const phone =
                formData
                    .get("phone")
                    .trim();

            if (
                !isValidBangladeshPhone(phone)
            ) {
                alert(
                    "Please enter a valid Bangladesh mobile number. Example: 01712345678"
                );

                return;
            }

            const order =
                createOrder(formData);

            const orderSaved =
                saveOrder(order);

            if (!orderSaved) {
                alert(
                    "Sorry, your order could not be saved. Please try again."
                );

                return;
            }

            clearCart();

localStorage.setItem(
    "tbsp-last-order-id",
    order.id
);

window.location.href =
    `order-success.html?orderId=${encodeURIComponent(order.id)}`;
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