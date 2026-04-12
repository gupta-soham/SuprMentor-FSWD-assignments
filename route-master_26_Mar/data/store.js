/** In-memory bookstore data (replace with DB in later assignments) */

let authorId = 3;
let bookId = 4;

const authors = [
  { id: 1, name: "Arundhati Roy", country: "India" },
  { id: 2, name: "Ruskin Bond", country: "India" },
  { id: 3, name: "J.K. Rowling", country: "UK" },
];

const books = [
  {
    id: 1,
    title: "The God of Small Things",
    authorId: 1,
    year: 1997,
    genre: "Fiction",
  },
  {
    id: 2,
    title: "The Room on the Roof",
    authorId: 2,
    year: 1956,
    genre: "Fiction",
  },
  {
    id: 3,
    title: "Harry Potter and the Philosopher's Stone",
    authorId: 3,
    year: 1997,
    genre: "Fantasy",
  },
];

function nextAuthorId() {
  return ++authorId;
}

function nextBookId() {
  return ++bookId;
}

module.exports = { authors, books, nextAuthorId, nextBookId };
