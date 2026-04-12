/**
 * Route Master — Assignment 26 Mar 2026
 * Bookstore API: books + authors
 *
 * npm install && npm start
 * Base: http://localhost:4000
 */

const express = require("express");
const booksRouter = require("./routes/books");
const authorsRouter = require("./routes/authors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Bookstore API",
    endpoints: {
      books: "/api/books",
      authors: "/api/authors",
    },
  });
});

app.use("/api/books", booksRouter);
app.use("/api/authors", authorsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Bookstore server http://localhost:${PORT}`);
});
