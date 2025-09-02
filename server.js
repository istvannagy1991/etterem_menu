require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: "Hibás bejelentkezés" });
});

// Menü betöltése
app.get("/menu", (req, res) => {
  const filePath = path.join(__dirname, "menu.json");
  if (!fs.existsSync(filePath)) return res.json([]);
  const data = fs.readFileSync(filePath, "utf-8");
  res.json(JSON.parse(data || "[]"));
});

// Menü mentése – csak bejelentkezve
app.post("/menu", (req, res) => {
  const { username, password, etelek } = req.body;

  // Egyszerű jogosultság ellenőrzés
  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return res.status(401).json({ success: false, message: "Nincs jogosultság" });
  }

  // Mentés fájlba
  const filePath = path.join(__dirname, "menu.json");
  fs.writeFileSync(filePath, JSON.stringify(etelek, null, 2));
  res.json({ success: true });
});

// Indítás
app.listen(PORT, () => {
  console.log(`Szerver fut: http://localhost:${PORT}`);
});
