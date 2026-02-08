const API_URL = "http://localhost:5000/api/products";

async function fetchCategories() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        const categories = [...new Set(products.map(p => p.category))];
        console.log("Categories:", categories);
    } catch (error) {
        console.error("Error fetching categories:", error.message);
    }
}

fetchCategories();
