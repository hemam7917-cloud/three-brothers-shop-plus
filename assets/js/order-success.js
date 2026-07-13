"use strict";

/* =================================
   Storage Configuration
================================= */

const ORDERS_STORAGE_KEY = "tbsp-orders";

/* =================================
   DOM Element
================================= */

const orderSuccessContent =
    document.getElementById(
        "order-success-content"
    );

/* =================================
   Load Orders
================================= */

function loadOrders() {
    try {
        const savedOrders =
            localStorage.getItem(
                ORDERS_STORAGE_KEY
            );

        if (!savedOrders) {
            return [];
        }

        const parsedOrders =
            JSON.parse(savedOrders);

        return Array.isArray(parsedOrders)
            ? parsedOrders
            : [];

    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );

        return [];
    }
}

/* =================================
   Helpers
================================= */

function formatPrice(amount) {
    return `৳${Number(amount).toLocaleString("en-BD")}`;
}

function formatDate(dateString) {
    const date =
        new Date(dateString);

    return date.toLocaleString(
        "en-BD"
    );
}

/* =================================
   Read Order ID
================================= */

function getOrderIdFromUrl() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("orderId");
}

/* =================================
   Find Order
================================= */

function findOrder(orderId) {
    const orders = loadOrders();

    return orders.find(
        (order) => order.id === orderId
    );
}

/* =================================
   Render Missing Order
================================= */

function renderMissingOrder() {
    if (!orderSuccessContent) return;

    orderSuccessContent.innerHTML = `
        <div class="order-success-card">

            <div
                class="order-success-icon"
                aria-hidden="true">
                ⚠️
            </div>

            <h1>
                Order Not Found
            </h1>

            <p>
                We could not find the requested order.
            </p>

            <a
                href="index.html"
                class="btn btn-primary">
                Return Home
            </a>

        </div>
    `;
}

/* =================================
   Render Order
================================= */

function renderOrderSuccess(order) {
    if (!orderSuccessContent) return;

    const orderItemsHTML = order.items
        .map((item) => {
            const quantity =
                Number(item.quantity || 0);

            const price =
                Number(item.price || 0);

            return `
                <div class="order-success-item">

                    <div>

                        <strong>
                            ${item.name}
                        </strong>

                        <p>
                            ${quantity}
                            ×
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

    orderSuccessContent.innerHTML = `
        <div class="order-success-card">

            <div
                class="order-success-icon"
                aria-hidden="true">
                ✅
            </div>

            <h1>
                Order Placed Successfully!
            </h1>

            <p>
                Thank you,
                <strong>
                    ${order.customer.fullName}
                </strong>.
            </p>

            <div class="order-success-meta">

                <div>
                    <span>Order ID</span>

                    <strong>
                        ${order.id}
                    </strong>
                </div>

                <div>
                    <span>Order Date</span>

                    <strong>
                        ${formatDate(
                            order.createdAt
                        )}
                    </strong>
                </div>

                <div>
                    <span>Status</span>

                    <strong class="order-status">
                        ${order.status}
                    </strong>
                </div>

            </div>

            <div class="order-success-section">

                <h2>
                    Delivery Information
                </h2>

                <p>
                    <strong>
                        ${order.customer.fullName}
                    </strong>
                </p>

                <p>
                    ${order.customer.phone}
                </p>

                <p>
                    ${order.deliveryAddress.address},
                    ${order.deliveryAddress.district}
                </p>

            </div>

            <div class="order-success-section">

                <h2>
                    Order Items
                </h2>

                <div class="order-success-items">
                    ${orderItemsHTML}
                </div>

            </div>

            <div class="order-success-section">

                <div class="summary-row">

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${formatPrice(
                            order.totals.subtotal
                        )}
                    </strong>

                </div>

                <div class="summary-row">

                    <span>
                        Shipping
                    </span>

                    <strong>
                        ${
                            Number(
                                order.totals
                                    .shippingCharge
                            ) === 0
                                ? "FREE"
                                : formatPrice(
                                    order.totals
                                        .shippingCharge
                                )
                        }
                    </strong>

                </div>

                <div
                    class="summary-row
                           summary-total">

                    <span>
                        Grand Total
                    </span>

                    <strong>
                        ${formatPrice(
                            order.totals
                                .grandTotal
                        )}
                    </strong>

                </div>

            </div>

            <div class="order-success-actions">

                <a
                    href="index.html"
                    class="btn btn-primary">
                    Continue Shopping
                </a>

                <a
                    href="products.html"
                    class="btn btn-outline">
                    Browse Products
                </a>

            </div>

        </div>
    `;
}

/* =================================
   Initialize
================================= */

const orderId =
    getOrderIdFromUrl();

if (!orderId) {
    renderMissingOrder();
} else {
    const order =
        findOrder(orderId);

    if (!order) {
        renderMissingOrder();
    } else {
        renderOrderSuccess(order);
    }
}