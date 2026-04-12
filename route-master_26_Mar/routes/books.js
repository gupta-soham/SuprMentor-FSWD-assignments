const express = require("express");
const { books, authors, nextBookId } = require("../data/store");

const router = express.Router();

function authorName(authorId) {
  const a = authors.find((x) => x.id === authorId);
  return a ? a.name : null;
}

router.get("/", (req, res) => {
  const { genre, authorId } = req.query;
  let list = [...books];
  if (genre)
    list = list.filter(
      (b) => b.genre.toLowerCase() === String(genre).toLowerCase(),
    );
  if (authorId) list = list.filter((b) => b.authorId === Number(authorId));
  res.json(
    list.map((b) => ({
      ...b,
      authorName: authorName(b.authorId),
    })),
  );
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json({ ...book, authorName: authorName(book.authorId) });
});

router.post("/", express.json(), (req, res) => {
  const { title, authorId, year, genre } = req.body;
  if (!title || authorId == null) {
    return res.status(400).json({ error: "title and authorId are required" });
  }
  const aid = Number(authorId);
  if (!authors.some((a) => a.id === aid)) {
    return res.status(400).json({ error: "authorId does not exist" });
  }
  const book = {
    id: nextBookId(),
    title: String(title).trim(),
    authorId: aid,
    year: year != null ? Number(year) : null,
    genre: genre ? String(genre) : "General",
  };
  books.push(book);
  res.status(201).json({ ...book, authorName: authorName(book.authorId) });
});

module.exports = router;
