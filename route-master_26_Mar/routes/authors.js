const express = require("express");
const { authors, books, nextAuthorId } = require("../data/store");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(authors);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const author = authors.find((a) => a.id === id);
  if (!author) return res.status(404).json({ error: "Author not found" });
  const authorBooks = books.filter((b) => b.authorId === id);
  res.json({ ...author, books: authorBooks });
});

router.post("/", express.json(), (req, res) => {
  const { name, country } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "name is required" });
  }
  const author = {
    id: nextAuthorId(),
    name: name.trim(),
    country: country || "",
  };
  authors.push(author);
  res.status(201).json(author);
});

module.exports = router;
