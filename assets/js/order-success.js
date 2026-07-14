"use strict";

/* =================================
   Storage Configuration
================================= */

const ORDERS_STORAGE_KEY =
    "tbsp-orders";

const LAST_ORDER_ID_KEY =
    "tbsp-last-order-id";


    /* =================================
   Order Tracking Configuration
================================= */

const ORDER_STATUS_STEPS = [
    {
        key: "pending",
        label: "Order Placed",
        description:
            "Your order has been received."
    },
    {
        key: "confirmed",
        label: "Order Confirmed",
        description:
            "Your order has been confirmed."
    },
    {
        key: "processing",
        label: "Processing",
        description:
            "Your products are being prepared."
    },
    {
        key: "shipped",
        label: "Shipped",
        description:
            "Your order has left our facility."
    },
    {
        key: "delivered",
        label: "Delivered",
        description:
            "Your order has been delivered."
    }
];


/* =================================
   Create Order Tracking Timeline
================================= */

function createOrderTrackingHTML(
    status
) {
    const normalizedStatus =
        normalizeOrderStatus(
            status
        );

    /* Cancelled order */
    if (
        normalizedStatus ===
        "cancelled"
    ) {
        return `
            <div class="order-cancelled-state">

                <div
                    class="order-cancelled-icon"
                    aria-hidden="true">
                    ❌
                </div>

                <div>

                    <h3>
                        Order Cancelled
                    </h3>

                    <p>
                        This order has been cancelled.
                    </p>

                </div>

            </div>
        `;
    }

    const currentStatusIndex =
        getOrderStatusIndex(
            normalizedStatus
        );

    const safeStatusIndex =
        currentStatusIndex >= 0
            ? currentStatusIndex
            : 0;

    const timelineHTML =
        ORDER_STATUS_STEPS
            .map(
                (
                    step,
                    index
                ) => {
                    let stateClass =
                        "upcoming";

                    let icon =
                        "○";

                    if (
                        index <
                        safeStatusIndex
                    ) {
                        stateClass =
                            "completed";

                        icon =
                            "✓";
                    }

                    if (
                        index ===
                        safeStatusIndex
                    ) {
                        stateClass =
                            "current";

                        icon =
                            "●";
                    }

                    return `
                        <div
                            class="
                                tracking-step
                                tracking-step-${stateClass}
                            ">

                            <div
                                class="tracking-step-marker"
                                aria-hidden="true">

                                ${icon}

                            </div>

                            <div
                                class="tracking-step-content">

                                <h3>
                                    ${step.label}
                                </h3>

                                <p>
                                    ${step.description}
                                </p>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");

    return `
        <div
            class="order-tracking-timeline"
            aria-label="Order tracking progress">

            ${timelineHTML}

        </div>
    `;
}



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
    return loadStorageArray(
        ORDERS_STORAGE_KEY
    );
}

/* =================================
   Format Date
================================= */

function formatDate(
    dateString
) {
    const date =
        new Date(
            dateString
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown";
    }

    return date.toLocaleString(
        "en-BD"
    );
}

/* =================================
   Normalize Order Status
================================= */

function normalizeOrderStatus(
    status
) {
    return String(
        status || "pending"
    )
        .trim()
        .toLowerCase();
}


/* =================================
   Get Order Status Index
================================= */

function getOrderStatusIndex(
    status
) {
    const normalizedStatus =
        normalizeOrderStatus(
            status
        );

    return ORDER_STATUS_STEPS
        .findIndex(
            (step) =>
                step.key ===
                normalizedStatus
        );
}

/* =================================
   Read Order ID
================================= */

function getRequestedOrderId() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlOrderId =
        params.get(
            "orderId"
        );

    const lastOrderId =
        localStorage.getItem(
            LAST_ORDER_ID_KEY
        );

    return (
        urlOrderId ||
        lastOrderId
    );
}

/* =================================
   Find Order
================================= */

function findOrder(
    orderId
) {
    if (!orderId) {
        return null;
    }

    const orders =
        loadOrders();

    return orders.find(
        (order) =>
            String(order.id) ===
            String(orderId)
    ) || null;
}

/* =================================
   Render Missing Order
================================= */

function renderMissingOrder() {
    if (
        !orderSuccessContent
    ) {
        return;
    }

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
                We could not find
                the requested order.
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

function renderOrderSuccess(
    order
) {
    if (
        !orderSuccessContent
    ) {
        return;
    }

    const orderItems =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];

    const orderItemsHTML =
        orderItems
            .map((item) => {
                const quantity =
                    Number(
                        item.quantity || 0
                    );

                const price =
                    Number(
                        item.price || 0
                    );

                return `
                    <div class="order-success-item">

                        <div>

                            <strong>
                                ${item.name}
                            </strong>

                            <p>
                                ${quantity}
                                ×
                                ${formatPrice(
                                    price
                                )}
                            </p>

                        </div>

                        <strong>
                            ${formatPrice(
                                price *
                                quantity
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
                    ${
                        order.customer
                            ?.fullName ||
                        "Customer"
                    }
                </strong>.
            </p>

            <div class="order-success-meta">

                <div>

                    <span>
                        Order ID
                    </span>

                    <strong>
                        ${order.id}
                    </strong>

                </div>

                <div>

                    <span>
                        Order Date
                    </span>

                    <strong>
                        ${formatDate(
                            order.createdAt
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        Status
                    </span>

                    <strong class="order-status">
                        ${
                            order.status ||
                            "pending"
                        }
                    </strong>

                </div>

            </div>

            <div class="order-success-section">

    <h2>
        Order Tracking
    </h2>

    ${
        createOrderTrackingHTML(
            order.status
        )
    }

</div>

            <div class="order-success-section">

                <h2>
                    Delivery Information
                </h2>

                <p>
                    <strong>
                        ${
                            order.customer
                                ?.fullName ||
                            ""
                        }
                    </strong>
                </p>

                <p>
                    ${
                        order.customer
                            ?.phone ||
                        ""
                    }
                </p>

                <p>
                    ${
                        order.deliveryAddress
                            ?.address ||
                        ""
                    }${
                        order.deliveryAddress
                            ?.district
                            ? `, ${
                                order
                                    .deliveryAddress
                                    .district
                            }`
                            : ""
                    }
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
                            order.totals
                                ?.subtotal ||
                            0
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
                                    ?.shippingCharge ||
                                0
                            ) === 0
                                ? "FREE"
                                : formatPrice(
                                    order
                                        .totals
                                        ?.shippingCharge ||
                                    0
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
                                ?.grandTotal ||
                            0
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

const requestedOrderId =
    getRequestedOrderId();

const selectedOrder =
    findOrder(
        requestedOrderId
    );

console.log(
    "Requested Order ID:",
    requestedOrderId
);

console.log(
    "Saved Orders:",
    loadOrders()
);

console.log(
    "Selected Order:",
    selectedOrder
);

if (!selectedOrder) {
    renderMissingOrder();
} else {
    renderOrderSuccess(
        selectedOrder
    );
}