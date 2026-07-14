"use strict";

/* =================================
   Storage Configuration
================================= */

const ORDERS_STORAGE_KEY =
    "tbsp-orders";

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