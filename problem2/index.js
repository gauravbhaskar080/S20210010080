
const express = require('express');

const app = express();
const PORT = 3000;


const BASE_URL = 'http://20.244.56.144/test/companies';
const COMPANIES = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const CATEGORIES = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];


const dummyData = {
    AMZ: {
        Laptop: [
            { productName: "Laptop 1", price: 2236, rating: 4.7, discount: 63, availability: "yes" },
            { productName: "Laptop 2", price: 1244, rating: 4.5, discount: 45, availability: "out-of-stock" },
            { productName: "Laptop 3", price: 9102, rating: 4.44, discount: 98, availability: "out-of-stock" },
            { productName: "Laptop 4", price: 1258, rating: 3.8, discount: 33, availability: "yes" }
        ],
    },
    FLP: {
        Laptop: [
            { productName: "Laptop 5", price: 1500, rating: 4.6, discount: 20, availability: "yes" },
            { productName: "Laptop 6", price: 2000, rating: 4.2, discount: 10, availability: "yes" }
        ],
    },
};

const generateUniqueId = (company, productName) => {
    return `${company}_${productName.replace(/\s+/g, '_')}_${Date.now()}`;
};

const validateInputs = (req, res, next) => {
    const { categoryname } = req.params;
    const { n, page, minPrice, maxPrice } = req.query;

    if (!CATEGORIES.includes(categoryname)) {
        return res.status(400).json({ error: 'Invalid category name' });
    }

    if (n) {
        const numberOfProducts = parseInt(n, 10);
        if (isNaN(numberOfProducts) || numberOfProducts <= 0) {
            return res.status(400).json({ error: 'Invalid value for n' });
        }
    }

    if (page) {
        const pageNumber = parseInt(page, 10);
        if (isNaN(pageNumber) || pageNumber <= 0) {
            return res.status(400).json({ error: 'Invalid page number' });
        }
    }

    next();
};

app.get('/categories/:categoryname/products', validateInputs, async (req, res) => {
    const { categoryname } = req.params;
    const { n = 10, page = 1, minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER, sort } = req.query;

    const topN = parseInt(n, 10);
    const offset = (page - 1) * topN;

    const products = [];
    for (const company of COMPANIES) {
        if (dummyData[company] && dummyData[company][categoryname]) {
            const companyProducts = dummyData[company][categoryname];
            products.push(...companyProducts.map(product => ({
                company,
                ...product
            })));
        }
    }

    const filteredProducts = products
        .map(product => ({
            id: generateUniqueId(product.company, product.productName),
            ...product
        }))
        .filter(product => product.price >= minPrice && product.price <= maxPrice);

    if (sort) {
        const [sortField, order] = sort.split(':');
        filteredProducts.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            if (order === 'asc') {
                return valA < valB ? -1 : 1;
            } else {
                return valA > valB ? -1 : 1;
            }
        });
    }

    const paginatedProducts = filteredProducts.slice(offset, offset + topN);
    res.json(paginatedProducts);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

