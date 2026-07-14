"use strict";

/* =================================
   Storage Configuration
================================= */

const CART_STORAGE_KEY = "tbsp-cart";
const ORDERS_STORAGE_KEY = "tbsp-orders";
const LAST_ORDER_ID_KEY = "tbsp-last-order-id";

/* =================================
   DOM Elements
================================= */

const checkoutForm =
    document.getElementById(
        "checkout-form"
    );

const placeOrderButton =
    document.getElementById(
        "place-order-btn"
    );

const checkoutContent =
    document.getElementById(
        "checkout-content"
    );

const checkoutEmpty =
    document.getElementById(
        "checkout-empty"
    );

const checkoutSummary =
    document.getElementById(
        "checkout-summary"
    );


    const fullNameInput =
    document.getElementById(
        "full-name"
    );

const phoneInput =
    document.getElementById(
        "phone"
    );

const addressInput =
    document.getElementById(
        "address"
    );

const districtInput =
    document.getElementById(
        "district"
    );


/* =================================
   State
================================= */

const cart =
    loadStorageArray(
        CART_STORAGE_KEY
    );

let isOrderProcessing = false;

/* =================================
   Cart Helpers
================================= */

function getTotalQuantity() {
    return cart.reduce(
        (total, item) =>
            total +
            Number(
                item.quantity || 0
            ),
        0
    );
}

function getSubtotal() {
    return cart.reduce(
        (total, item) =>
            total +
            Number(
                item.price || 0
            ) *
            Number(
                item.quantity || 0
            ),
        0
    );
}

function getShippingCharge() {
    const subtotal =
        getSubtotal();

    return subtotal >= 1000
        ? 0
        : 60;
}



/* =================================
   Form Validation Helpers
================================= */

function getErrorElement(
    field
) {
    return document.getElementById(
        `${field.id}-error`
    );
}

function showFieldError(
    field,
    message
) {
    if (!field) return;

    field.classList.add(
        "is-invalid"
    );

    field.setAttribute(
        "aria-invalid",
        "true"
    );

    const errorElement =
        getErrorElement(field);

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function clearFieldError(
    field
) {
    if (!field) return;

    field.classList.remove(
        "is-invalid"
    );

    field.removeAttribute(
        "aria-invalid"
    );

    const errorElement =
        getErrorElement(field);

    if (errorElement) {
        errorElement.textContent = "";
    }
}

function validateFullName() {
    const value =
        fullNameInput
            ?.value
            .trim() || "";

    if (!value) {
        showFieldError(
            fullNameInput,
            "Please enter your full name."
        );

        return false;
    }

    if (value.length < 3) {
        showFieldError(
            fullNameInput,
            "Full name must be at least 3 characters."
        );

        return false;
    }

    clearFieldError(
        fullNameInput
    );

    return true;
}


function validatePhone() {
    const value =
        phoneInput
            ?.value
            .trim() || "";

    if (!value) {
        showFieldError(
            phoneInput,
            "Please enter your phone number."
        );

        return false;
    }

    if (
        !isValidBangladeshPhone(
            value
        )
    ) {
        showFieldError(
            phoneInput,
            "Enter a valid Bangladesh mobile number."
        );

        return false;
    }

    clearFieldError(
        phoneInput
    );

    return true;
}


function validateAddress() {
    const value =
        addressInput
            ?.value
            .trim() || "";

    if (!value) {
        showFieldError(
            addressInput,
            "Please enter your delivery address."
        );

        return false;
    }

    if (value.length < 8) {
        showFieldError(
            addressInput,
            "Please enter a more complete address."
        );

        return false;
    }

    clearFieldError(
        addressInput
    );

    return true;
}


function validateDistrict() {
    const value =
        districtInput
            ?.value
            .trim() || "";

    if (!value) {
        showFieldError(
            districtInput,
            "Please enter your district."
        );

        return false;
    }

    clearFieldError(
        districtInput
    );

    return true;
}

function validateCheckoutForm() {
    const results = [
        validateFullName(),
        validatePhone(),
        validateAddress(),
        validateDistrict()
    ];

    return results.every(
        Boolean
    );
}

function focusFirstInvalidField() {
    const firstInvalidField =
        checkoutForm?.querySelector(
            ".is-invalid"
        );

    if (firstInvalidField) {
        firstInvalidField.focus();
    }
}

const validationFields = [
    fullNameInput,
    phoneInput,
    addressInput,
    districtInput
];

validationFields.forEach(
    (field) => {
        if (!field) return;

        field.addEventListener(
            "input",
            () => {
                clearFieldError(
                    field
                );
            }
        );
    }
);


/* =================================
   Bangladesh Phone Validation
================================= */

function isValidBangladeshPhone(
    phone
) {
    const cleanPhone =
        phone.replace(
            /[\s-]/g,
            ""
        );

    const phonePattern =
        /^(?:\+?88)?01[3-9]\d{8}$/;

    return phonePattern.test(
        cleanPhone
    );
}

/* =================================
   Generate Order ID
================================= */

function generateOrderId() {
    return generateUniqueId(
        "TBSP"
    );
}

/* =================================
   Render Empty Checkout
================================= */

function renderEmptyCheckout() {
    if (
        !checkoutContent ||
        !checkoutEmpty
    ) {
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

            <h2>
                Your Cart Is Empty
            </h2>

            <p>
                Add products before
                proceeding to checkout.
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

    const totalItems =
        getTotalQuantity();

    const subtotal =
        getSubtotal();

    const shippingCharge =
        getShippingCharge();

    const grandTotal =
        subtotal +
        shippingCharge;

    const productsHTML =
        cart
            .map((product) => {
                const quantity =
                    Number(
                        product.quantity || 0
                    );

                const price =
                    Number(
                        product.price || 0
                    );

                return `
                    <div class="checkout-summary-item">

                        <div>

                            <strong>
                                ${product.name}
                            </strong>

                            <p>
                                ${quantity}
                                ×
                                ${formatPrice(price)}
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

    checkoutSummary.innerHTML = `
        <div
            class="checkout-card
                   checkout-summary-card">

            <h2>
                Order Summary
            </h2>

            <div class="checkout-products">
                ${productsHTML}
            </div>

            <div class="summary-row">

                <span>
                    Total Items
                </span>

                <strong>
                    ${totalItems}
                </strong>

            </div>

            <div class="summary-row">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${formatPrice(
                        subtotal
                    )}
                </strong>

            </div>

            <div class="summary-row">

                <span>
                    Shipping
                </span>

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

            <div
                class="summary-row
                       summary-total">

                <span>
                    Total
                </span>

                <strong>
                    ${formatPrice(
                        grandTotal
                    )}
                </strong>

            </div>

        </div>
    `;
}

/* =================================
   Create Order Object
================================= */

function createOrder(
    formData
) {
    const subtotal =
        getSubtotal();

    const shippingCharge =
        getShippingCharge();

    const grandTotal =
        subtotal +
        shippingCharge;

    return {
        id: generateOrderId(),

        customer: {
            fullName:
                String(
                    formData.get(
                        "fullName"
                    ) || ""
                ).trim(),

            phone:
                String(
                    formData.get(
                        "phone"
                    ) || ""
                ).trim(),

            email:
                String(
                    formData.get(
                        "email"
                    ) || ""
                ).trim()
        },

        deliveryAddress: {
            address:
                String(
                    formData.get(
                        "address"
                    ) || ""
                ).trim(),

            district:
                String(
                    formData.get(
                        "district"
                    ) || ""
                ).trim(),

            postalCode:
                String(
                    formData.get(
                        "postalCode"
                    ) || ""
                ).trim()
        },

        paymentMethod:
            formData.get(
                "paymentMethod"
            ),

        items:
            cart.map(
                (item) => ({
                    ...item
                })
            ),

        totals: {
            totalItems:
                getTotalQuantity(),

            subtotal,

            shippingCharge,

            grandTotal
        },

        status: "pending",

        createdAt:
            new Date()
                .toISOString()
    };
}

/* =================================
   Save Order
================================= */

function saveOrder(order) {
    const orders =
        loadStorageArray(
            ORDERS_STORAGE_KEY
        );

    orders.push(order);

    return saveStorageArray(
        ORDERS_STORAGE_KEY,
        orders
    );
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
   Checkout Form Submission
================================= */

if (checkoutForm) {
    checkoutForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            /* Prevent duplicate orders */
            if (isOrderProcessing) {
                return;
            }

            /* Cart protection */
            if (cart.length === 0) {
                renderEmptyCheckout();

                showToast(
                    "Your cart is empty.",
                    "error"
                );

                return;
            }

            /* Native HTML validation */
            const isFormValid =
    validateCheckoutForm();

if (!isFormValid) {
    focusFirstInvalidField();

    showToast(
        "Please correct the highlighted fields.",
        "error"
    );

    return;
}

            const formData =
                new FormData(
                    checkoutForm
                );

            
            /* Start processing */
            isOrderProcessing = true;

            setButtonLoading(
                placeOrderButton,
                "Processing Order..."
            );

            try {
                const order =
                    createOrder(
                        formData
                    );

                const orderSaved =
                    saveOrder(
                        order
                    );

                if (!orderSaved) {
                    throw new Error(
                        "Order could not be saved."
                    );
                }

                /* Save last order ID */
                localStorage.setItem(
                    LAST_ORDER_ID_KEY,
                    String(order.id)
                );

                /* Clear cart */
                clearCart();

                /* Success feedback */
                setButtonSuccess(
                    placeOrderButton,
                    "✓ Order Placed",
                    500
                );

                showToast(
                    "Order placed successfully.",
                    "success"
                );

                /* Redirect with Order ID */
                setTimeout(() => {
                    window.location.href =
                        `order-success.html?orderId=${
                            encodeURIComponent(
                                order.id
                            )
                        }`;
                }, 500);

            } catch (error) {
                console.error(
                    "Order processing failed:",
                    error
                );

                isOrderProcessing = false;

                resetButtonState(
                    placeOrderButton
                );

                showToast(
                    "Could not place your order. Please try again.",
                    "error"
                );
            }
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