const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 6000;
const WINDOW_SIZE = 10;
const DUMMY_SERVER_URL = "http://20.244.56.144/test";

const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIzNDczNzc1LCJpYXQiOjE3MjM0NzM0NzUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjdiMWY2ZWU5LTFkMjQtNGY1Yi04MDc3LWNiMWM1MmU4Mzk5MiIsInN1YiI6ImdhdXJhdi5iMjFAaWlpdHMuaW4ifSwiY29tcGFueU5hbWUiOiJpaWl0cyIsImNsaWVudElEIjoiN2IxZjZlZTktMWQyNC00ZjViLTgwNzctY2IxYzUyZTgzOTkyIiwiY2xpZW50U2VjcmV0IjoiSVhEZ1ZGa1dLcXV6TWtiRyIsIm93bmVyTmFtZSI6IkdhdXJhdiBCaGFza2FyIiwib3duZXJFbWFpbCI6ImdhdXJhdi5iMjFAaWlpdHMuaW4iLCJyb2xsTm8iOiJTMjAyMTAwMTAwODAifQ.3Ai3uKaQ0ah6w46WiADrvC43_3tZdpCyblCRsWa4Z0c";

let windowState = [];

app.use(express.json());

const fetchNumbers = async (qualifier) => {
    try {
        const response = await axios.get(`${DUMMY_SERVER_URL}/${qualifier}`, {
            timeout: 500,
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}`
            }
        });
        return response.data.numbers;
    } catch (error) {
        return [];
    }
};

const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
};

app.get('/test/:id', async (req, res) => {
    const qualifier = req.params.id;

    if (!['primes', 'fibo', 'even', 'rand'].includes(qualifier)) {
        return res.status(400).send({ error: "Invalid qualifier" });
    }

    const newNumbers = await fetchNumbers(qualifier);

    const uniqueNumbers = [...new Set(newNumbers)];

    const windowPrevState = [...windowState];

    windowState = [...windowState, ...uniqueNumbers];
    if (windowState.length > WINDOW_SIZE) {
        windowState = windowState.slice(windowState.length - WINDOW_SIZE);
    }

    const avg = calculateAverage(windowState);

    res.json({
        numbers: uniqueNumbers,
        windowPrevState,
        windowCurrState: windowState,
        avg: parseFloat(avg)
    });
});

app.listen(PORT, () => {
    console.log(`Average Calculator Microservice is running on port ${PORT}`);
});
