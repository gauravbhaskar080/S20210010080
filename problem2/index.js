
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const BASE_URL = 'http://20.244.56.144/test/companies';
const COMPANIES = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const CATEGORIES = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];

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

    try {
        const response = await axios.get(`${BASE_URL}/${categoryname}`);
        const products = response.data; 

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

        // Implement pagination
        const paginatedProducts = filteredProducts.slice(offset, offset + topN);
        res.json(paginatedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products from the server' });
    }
});

// GET /categories/:categoryname/products/:productid
app.get('/categories/:categoryname/products/:productid', (req, res) => {
    const { productid } = req.params;

    // Search for the product in the external server
    axios.get(`${BASE_URL}/${req.params.categoryname}`)
        .then(response => {
            const products = response.data; // Adjust this based on the structure of the response
            let foundProduct = null;

            // Check for the product in the fetched data
            for (const product of products) {
                const generatedId = generateUniqueId(product.company, product.productName);
                if (generatedId === productid) {
                    foundProduct = { ...product, id: productid };
                    break;
                }
            }

            if (foundProduct) {
                res.json(foundProduct);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch products from the server' });
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

