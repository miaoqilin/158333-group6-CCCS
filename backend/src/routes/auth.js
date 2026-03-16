const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
  res.json({ message: "Register route placeholder" });
});

router.post("/login", (req, res) => {
  res.json({ message: "Login route placeholder" });
});

module.exports = router;