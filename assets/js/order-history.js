"use strict";

/* =================================
   Storage Configuration
================================= */

const ORDERS_STORAGE_KEY =
    "tbsp-orders";


    /* =================================
   Order Status Steps
================================= */

const ORDER_STATUS_STEPS = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered"
];

/* =================================
   DOM Element
================================= */

const orderHistoryList =
    document.getElementById(
        "order-history-list"
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

function formatOrderDate(
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
        return "Unknown Date";
    }

    return date.toLocaleString(
        "en-BD"
    );
}

/* =================================
   Get Order Progress
================================= */

function getOrderProgress(
    status
) {
    const normalizedStatus =
        String(
            status || "pending"
        )
            .trim()
            .toLowerCase();

    if (
        normalizedStatus ===
        "cancelled"
    ) {
        return {
            percentage: 0,
            label: "Cancelled",
            cancelled: true
        };
    }

    const currentIndex =
        ORDER_STATUS_STEPS
            .indexOf(
                normalizedStatus
            );

    const safeIndex =
        currentIndex >= 0
            ? currentIndex
            : 0;

    const percentage =
        (
            safeIndex /
            (
                ORDER_STATUS_STEPS.length -
                1
            )
        ) * 100;

    return {
        percentage,
        label:
            normalizedStatus,
        cancelled: false
    };
}



/* =================================
   Get Status Class
================================= */

function getStatusClass(
    status
) {
    const normalizedStatus =
        String(
            status || "pending"
        )
            .trim()
            .toLowerCase();

    return `order-status-${normalizedStatus}`;
}

/* =================================
   Render Empty State
================================= */

function renderEmptyOrderHistory() {
    if (!orderHistoryList) {
        return;
    }

    orderHistoryList.innerHTML = `
        <div class="order-history-empty">

            <div
                class="order-history-empty-icon"
                aria-hidden="true">
                📦
            </div>

            <h2>
                No Orders Yet
            </h2>

            <p>
                You have not placed any orders yet.
            </p>

            <a
                href="products.html"
                class="btn btn-primary">

                Start Shopping

            </a>

        </div>
    `;
}

/* =================================
   Render Orders
================================= */

function renderOrderHistory() {
    if (!orderHistoryList) {
        return;
    }

    const orders =
        loadOrders();

    if (orders.length === 0) {
        renderEmptyOrderHistory();

        return;
    }

    const newestOrdersFirst =
        [...orders].sort(
            (a, b) => {
                const dateA =
                    new Date(
                        a.createdAt
                    ).getTime();

                const dateB =
                    new Date(
                        b.createdAt
                    ).getTime();

                return dateB - dateA;
            }
        );

    orderHistoryList.innerHTML =
        newestOrdersFirst
            .map((order) => {
                const totalItems =
                    Number(
                        order.totals
                            ?.totalItems ||
                        0
                    );

                const grandTotal =
                    Number(
                        order.totals
                            ?.grandTotal ||
                        0
                    );

                const status =
                    String(
                        order.status ||
                        "pending"
                    );

                    const progress =
    getOrderProgress(
        status
    );

                return `
                    <article class="order-history-card">

                        <div class="order-history-card-header">

                            <div>

                                <span class="order-history-label">
                                    Order ID
                                </span>

                                <h2>
                                    ${order.id}
                                </h2>

                            </div>

                            <span
                                class="order-history-status
                                ${getStatusClass(status)}">

                                ${status}

                            </span>

                        </div>

                        <div class="order-history-meta">

                            <div>

                                <span>
                                    Order Date
                                </span>

                                <strong>
                                    ${formatOrderDate(
                                        order.createdAt
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Total Items
                                </span>

                                <strong>
                                    ${totalItems}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Grand Total
                                </span>

                                <strong>
                                    ${formatPrice(
                                        grandTotal
                                    )}
                                </strong>

                            </div>

                        </div>

                        <div
    class="
        order-progress
        ${
            progress.cancelled
                ? "order-progress-cancelled"
                : ""
        }
    ">

    <div class="order-progress-header">

        <span>
            Order Progress
        </span>

        <strong>
            ${
                progress.label
                    .replace(
                        /-/g,
                        " "
                    )
            }
        </strong>

    </div>

    <div
        class="order-progress-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${
            progress.percentage
        }">

        <div
            class="order-progress-bar"
            style="
                width:
                ${progress.percentage}%;
            ">
        </div>

    </div>

</div>

                        <div class="order-history-actions">

                            <a
                                href="order-success.html?orderId=${
                                    encodeURIComponent(
                                        order.id
                                    )
                                }"
                                class="btn btn-outline">

                                View Details

                            </a>

                        </div>

                    </article>
                `;
            })
            .join("");
}

/* =================================
   Initialize
================================= */

renderOrderHistory();