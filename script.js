console.log("Start");

console.log("Loading Products");

console.log("End");

console.log("Start");

setTimeout(() => {

    console.log("Products Loaded");

}, 3000);

console.log("End");

const order = new Promise((resolve) => {

    setTimeout(() => {

        resolve("Order Confirmed");

    }, 2000);

});

order.then(result => {

    console.log(result);

});

async function hello() {

    return "Welcome";

}

async function start() {

    const message = await hello();

    console.log(message);

}

start();

async function loadProducts() {

    const response = await fetch("products.json");

    const products = await response.json();

    console.log(products);

}

loadProducts();

async function loadProducts() {

    const response = await fetch("products.json");

    const products = await response.json();

    products.forEach(product => {

        console.log(product.name);

    });

}

loadProducts();

localStorage.setItem("name", "Emam Hasan");

console.log(
    localStorage.getItem("name")
);

const product = {

    name: "Rice",

    price: 80

};

localStorage.setItem(
    "product",
    JSON.stringify(product)
);

const product = JSON.parse(
    localStorage.getItem("product")
);

const cart = ["Rice", "Oil"];

localStorage.setItem(
    "cart",
    JSON.stringify(cart)
);

localStorage.setItem(
    "theme",
    "dark"
);