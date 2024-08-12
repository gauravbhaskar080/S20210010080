const express = require("express");

const app = express();
const PORT = 5000;

const data = {
  primes: [2, 3, 5, 7, 11],
  fibo: [1, 1, 2, 3, 5, 8],
  even: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  rand: [3, 9, 14, 25],
};

app.get("/numbers/:id", (req, res) => {
  const qualifier = req.params.id;
  const numbers = data[qualifier] || [];
  res.json({ numbers });
});

app.listen(PORT, () => {
  console.log(`Dummy server is running on port ${PORT}`);
});
