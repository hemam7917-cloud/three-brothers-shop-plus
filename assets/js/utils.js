"use strict";

/* =================================
   Shared Storage Helpers
================================= */

function loadStorageArray(key) {
    try {
        const savedData =
            localStorage.getItem(key);

        if (!savedData) {
            return [];
        }

        const parsedData =
            JSON.parse(savedData);

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

function saveStorageArray(
    key,
    data
) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {
        console.error(
            `Failed to save ${key}:`,
            error
        );

        return false;
    }
}


/* =================================
   Shared Currency Formatter
================================= */

function formatPrice(amount) {
    return `৳${Number(
        amount || 0
    ).toLocaleString("en-BD")}`;
}


/* =================================
   Shared Toast Notification
================================= */

function showToast(
    message,
    type = "success"
) {
    const existingToast =
        document.querySelector(
            ".app-toast"
        );

    if (existingToast) {
        existingToast.remove();
    }

    const toast =
        document.createElement("div");

    toast.className =
        `app-toast app-toast-${type}`;

    toast.setAttribute(
        "role",
        "status"
    );

    toast.setAttribute(
        "aria-live",
        "polite"
    );

    let icon = "✅";

    if (type === "info") {
        icon = "ℹ️";
    }

    if (type === "error") {
        icon = "⚠️";
    }

    toast.innerHTML = `
        <span
            class="app-toast-icon"
            aria-hidden="true">
            ${icon}
        </span>

        <span class="app-toast-message">
            ${message}
        </span>
    `;

    document.body.appendChild(
        toast
    );

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}


/* =================================
   Shared ID Helper
================================= */

function generateUniqueId(
    prefix = "TBSP"
) {
    const timestamp =
        Date.now();

    const randomNumber =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `${prefix}-${timestamp}-${randomNumber}`;
}

/* =================================
   Shared Button State Helpers
================================= */

function setButtonLoading(
    button,
    loadingText = "Processing..."
) {
    if (!button) return;

    if (!button.dataset.originalText) {
        button.dataset.originalText =
            button.innerHTML;
    }

    button.disabled = true;

    button.classList.add(
        "is-loading"
    );

    button.setAttribute(
        "aria-busy",
        "true"
    );

    button.innerHTML = `
        <span
            class="button-spinner"
            aria-hidden="true">
        </span>

        <span>
            ${loadingText}
        </span>
    `;
}


function setButtonSuccess(
    button,
    successText = "✓ Done",
    resetDelay = 1000
) {
    if (!button) return;

    button.classList.remove(
        "is-loading"
    );

    button.classList.add(
        "is-success"
    );

    button.setAttribute(
        "aria-busy",
        "false"
    );

    button.innerHTML =
        successText;

    setTimeout(() => {
        resetButtonState(
            button
        );
    }, resetDelay);
}


function resetButtonState(button) {
    if (!button) return;

    const originalText =
        button.dataset.originalText;

    if (originalText) {
        button.innerHTML =
            originalText;
    }

    button.disabled = false;

    button.classList.remove(
        "is-loading",
        "is-success"
    );

    button.setAttribute(
        "aria-busy",
        "false"
    );
}

/* =================================
   Recently Viewed Helpers
================================= */

const RECENTLY_VIEWED_STORAGE_KEY =
    "tbsp-recently-viewed";


function loadRecentlyViewed() {
    return loadStorageArray(
        RECENTLY_VIEWED_STORAGE_KEY
    );
}


function saveRecentlyViewed(
    products
) {
    return saveStorageArray(
        RECENTLY_VIEWED_STORAGE_KEY,
        products
    );
}


function addRecentlyViewedProduct(
    product,
    maxItems = 8
) {
    if (
        !product ||
        product.id === undefined ||
        product.id === null
    ) {
        return;
    }

    let recentlyViewed =
        loadRecentlyViewed();

    recentlyViewed =
        recentlyViewed.filter(
            (item) =>
                String(item.id) !==
                String(product.id)
        );

    recentlyViewed.unshift({
        ...product
    });

    recentlyViewed =
        recentlyViewed.slice(
            0,
            maxItems
        );

    saveRecentlyViewed(
        recentlyViewed
    );
}