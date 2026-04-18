require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const urlRoutes = require("./routes/urlRoutes");
const { globalLimiter } = require("./middleware/rateLimiter");

const PORT = process.env.PORT || 4010;
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(globalLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/", urlRoutes);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
});

module.exports = app;
