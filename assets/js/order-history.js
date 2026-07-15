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
   DOM Elements
================================= */

const orderHistoryList =
    document.getElementById(
        "order-history-list"
    );

const orderSearch =
    document.getElementById(
        "order-search"
    );

const orderStatusFilter =
    document.getElementById(
        "order-status-filter"
    );

const orderSort =
    document.getElementById(
        "order-sort"
    );

const resetOrderFiltersButton =
    document.getElementById(
        "reset-order-filters"
    );

const orderResultsCount =
    document.getElementById(
        "order-results-count"
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
   Save Orders
================================= */

function saveOrders(orders) {
    return saveStorageArray(
        ORDERS_STORAGE_KEY,
        orders
    );
}



/* =================================
   Format Order Date
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
   Normalize Status
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
   Order Cancellation Rules
================================= */

function canCancelOrder(status) {
    const normalizedStatus =
        normalizeOrderStatus(
            status
        );

    return (
        normalizedStatus === "pending" ||
        normalizedStatus === "confirmed"
    );
}


/* =================================
   Cancel Order
================================= */

function cancelOrder(orderId) {
    const orders =
        loadOrders();

    const orderIndex =
        orders.findIndex(
            (order) =>
                String(order.id) ===
                String(orderId)
        );

    if (orderIndex === -1) {
        showToast(
            "Order not found.",
            "error"
        );

        return;
    }

    const order =
        orders[orderIndex];

    if (
        !canCancelOrder(
            order.status
        )
    ) {
        showToast(
            "This order can no longer be cancelled.",
            "error"
        );

        return;
    }

    const confirmed =
        window.confirm(
            `Are you sure you want to cancel order "${order.id}"?`
        );

    if (!confirmed) {
        return;
    }

    orders[orderIndex] = {
        ...order,

        status: "cancelled",

        cancelledAt:
            new Date().toISOString()
    };

    const saved =
        saveOrders(
            orders
        );

    if (!saved) {
        showToast(
            "Could not cancel the order. Please try again.",
            "error"
        );

        return;
    }

    showToast(
        "Order cancelled successfully.",
        "info"
    );

    applyOrderFilters();
}

/* =================================
   Get Status CSS Class
================================= */

function getStatusClass(
    status
) {
    const normalizedStatus =
        normalizeOrderStatus(
            status
        );

    return (
        `order-status-${normalizedStatus}`
    );
}


/* =================================
   Get Order Progress
================================= */

function getOrderProgress(
    status
) {
    const normalizedStatus =
        normalizeOrderStatus(
            status
        );

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
   Search Orders
================================= */

function searchOrders(
    orders,
    searchTerm
) {
    const normalizedSearchTerm =
        String(
            searchTerm || ""
        )
            .trim()
            .toLowerCase();

    if (
        !normalizedSearchTerm
    ) {
        return orders;
    }

    return orders.filter(
        (order) => {
            const orderId =
                String(
                    order.id || ""
                )
                    .toLowerCase();

            return orderId.includes(
                normalizedSearchTerm
            );
        }
    );
}


/* =================================
   Filter Orders By Status
================================= */

function filterOrdersByStatus(
    orders,
    selectedStatus
) {
    const normalizedFilter =
        normalizeOrderStatus(
            selectedStatus
        );

    if (
        normalizedFilter ===
        "all"
    ) {
        return orders;
    }

    return orders.filter(
        (order) =>
            normalizeOrderStatus(
                order.status
            ) ===
            normalizedFilter
    );
}


/* =================================
   Sort Orders
================================= */

function sortOrders(
    orders,
    sortOption
) {
    const sortedOrders =
        [...orders];

    switch (sortOption) {

        case "oldest":

            sortedOrders.sort(
                (a, b) =>
                    getOrderTimestamp(a) -
                    getOrderTimestamp(b)
            );

            break;


        case "highest":

            sortedOrders.sort(
                (a, b) =>
                    getOrderGrandTotal(b) -
                    getOrderGrandTotal(a)
            );

            break;


        case "lowest":

            sortedOrders.sort(
                (a, b) =>
                    getOrderGrandTotal(a) -
                    getOrderGrandTotal(b)
            );

            break;


        case "newest":
        default:

            sortedOrders.sort(
                (a, b) =>
                    getOrderTimestamp(b) -
                    getOrderTimestamp(a)
            );

            break;
    }

    return sortedOrders;
}


/* =================================
   Order Data Helpers
================================= */

function getOrderTimestamp(
    order
) {
    const timestamp =
        new Date(
            order.createdAt
        ).getTime();

    return Number.isNaN(
        timestamp
    )
        ? 0
        : timestamp;
}


function getOrderGrandTotal(
    order
) {
    return Number(
        order.totals
            ?.grandTotal ||
        0
    );
}


/* =================================
   Update Results Count
================================= */

function updateOrderResultsCount(
    visibleCount,
    totalCount
) {
    if (
        !orderResultsCount
    ) {
        return;
    }

    if (
        totalCount === 0
    ) {
        orderResultsCount.textContent =
            "No orders available.";

        return;
    }

    if (
        visibleCount ===
        totalCount
    ) {
        orderResultsCount.textContent =
            `${totalCount} ${
                totalCount === 1
                    ? "order"
                    : "orders"
            } found.`;

        return;
    }

    orderResultsCount.textContent =
        `Showing ${visibleCount} of ${totalCount} orders.`;
}


/* =================================
   Render Empty Order History
================================= */

function renderEmptyOrderHistory() {
    if (
        !orderHistoryList
    ) {
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
                You have not placed
                any orders yet.
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
   Render No Matching Results
================================= */

function renderNoMatchingOrders() {
    if (
        !orderHistoryList
    ) {
        return;
    }

    orderHistoryList.innerHTML = `
        <div class="order-history-empty">

            <div
                class="order-history-empty-icon"
                aria-hidden="true">

                🔍

            </div>

            <h2>
                No Matching Orders
            </h2>

            <p>
                No orders match your
                current search or filter.
            </p>

            <button
                type="button"
                class="btn btn-outline"
                id="empty-reset-order-filters">

                Clear Filters

            </button>

        </div>
    `;
}


/* =================================
   Render Orders
================================= */

function renderOrders(
    orders
) {
    if (
        !orderHistoryList
    ) {
        return;
    }

    orderHistoryList.innerHTML =
        orders
            .map(
                (order) => {

                    const totalItems =
                        Number(
                            order.totals
                                ?.totalItems ||
                            0
                        );

                    const grandTotal =
                        getOrderGrandTotal(
                            order
                        );

                    const status =
                        normalizeOrderStatus(
                            order.status
                        );

                    const progress =
                        getOrderProgress(
                            status
                        );

                    return `
                        <article
                            class="order-history-card">

                            <div
                                class="order-history-card-header">

                                <div>

                                    <span
                                        class="order-history-label">

                                        Order ID

                                    </span>

                                    <h2>
                                        ${order.id}
                                    </h2>

                                </div>

                                <span
                                    class="
                                        order-history-status
                                        ${getStatusClass(
                                            status
                                        )}
                                    ">

                                    ${status}

                                </span>

                            </div>


                            <div
                                class="order-history-meta">

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

                                <div
                                    class="order-progress-header">

                                    <span>
                                        Order Progress
                                    </span>

                                    <strong>
                                        ${progress.label}
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


                            <div
    class="order-history-actions">

    <a
        href="order-success.html?orderId=${
            encodeURIComponent(
                order.id
            )
        }"
        class="btn btn-outline">

        View Details

    </a>

    ${
        canCancelOrder(
            status
        )
            ? `
                <button
                    type="button"
                    class="btn btn-danger"
                    data-action="cancel-order"
                    data-order-id="${order.id}">

                    Cancel Order

                </button>
            `
            : ""
    }

</div>

                        </article>
                    `;
                }
            )
            .join("");
}


/* =================================
   Apply Search, Filter And Sort
================================= */

function applyOrderFilters() {
    const allOrders =
        loadOrders();

    if (
        allOrders.length === 0
    ) {
        updateOrderResultsCount(
            0,
            0
        );

        renderEmptyOrderHistory();

        return;
    }

    const searchTerm =
        orderSearch
            ?.value ||
        "";

    const selectedStatus =
        orderStatusFilter
            ?.value ||
        "all";

    const selectedSort =
        orderSort
            ?.value ||
        "newest";


    let processedOrders =
        searchOrders(
            allOrders,
            searchTerm
        );


    processedOrders =
        filterOrdersByStatus(
            processedOrders,
            selectedStatus
        );


    processedOrders =
        sortOrders(
            processedOrders,
            selectedSort
        );


    updateOrderResultsCount(
        processedOrders.length,
        allOrders.length
    );


    if (
        processedOrders.length === 0
    ) {
        renderNoMatchingOrders();

        return;
    }


    renderOrders(
        processedOrders
    );
}


/* =================================
   Reset Order Filters
================================= */

function resetOrderFilters() {
    if (
        orderSearch
    ) {
        orderSearch.value =
            "";
    }

    if (
        orderStatusFilter
    ) {
        orderStatusFilter.value =
            "all";
    }

    if (
        orderSort
    ) {
        orderSort.value =
            "newest";
    }

    applyOrderFilters();

    if (
        orderSearch
    ) {
        orderSearch.focus();
    }
}


/* =================================
   Search Event
================================= */

if (
    orderSearch
) {
    orderSearch.addEventListener(
        "input",
        () => {
            applyOrderFilters();
        }
    );
}


/* =================================
   Status Filter Event
================================= */

if (
    orderStatusFilter
) {
    orderStatusFilter.addEventListener(
        "change",
        () => {
            applyOrderFilters();
        }
    );
}


/* =================================
   Sort Event
================================= */

if (
    orderSort
) {
    orderSort.addEventListener(
        "change",
        () => {
            applyOrderFilters();
        }
    );
}


/* =================================
   Main Reset Button Event
================================= */

if (
    resetOrderFiltersButton
) {
    resetOrderFiltersButton
        .addEventListener(
            "click",
            () => {
                resetOrderFilters();
            }
        );
}


/* =================================
   Order History Dynamic Events
================================= */

if (
    orderHistoryList
) {
    orderHistoryList.addEventListener(
        "click",
        (event) => {

            const resetButton =
                event.target.closest(
                    "#empty-reset-order-filters"
                );

            if (resetButton) {
                resetOrderFilters();

                return;
            }

            const cancelButton =
                event.target.closest(
                    '[data-action="cancel-order"]'
                );

            if (cancelButton) {
                const orderId =
                    cancelButton.dataset.orderId;

                cancelOrder(
                    orderId
                );
            }
        }
    );
}


/* =================================
   Refresh After Back Navigation
================================= */

window.addEventListener(
    "pageshow",
    () => {
        applyOrderFilters();
    }
);


/* =================================
   Initialize
================================= */

applyOrderFilters();