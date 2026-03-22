require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");  // <-- store sessions in MongoDB

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// --- SESSION CONFIGURATION ---
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// --- DATABASE ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ DB connection error", err));

// --- MODELS ---
const Trade = require("./models/trade");
const User = require("./models/User");

// --- AUTH MIDDLEWARE ---
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  next();
}

// --- ROUTES ---
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

// Signup route
app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();

    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    req.session.userId = user._id;
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

// Trades
app.get("/api/trades", requireLogin, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.session.userId });
    res.json(trades);
  } catch {
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

app.post("/api/trades", requireLogin, async (req, res) => {
  try {
    const trades = req.body.map(t => ({ ...t, userId: req.session.userId }));
    await Trade.deleteMany({ userId: req.session.userId });
    await Trade.insertMany(trades);
    res.json({ message: "Trades saved successfully" });
  } catch {
    res.status(500).json({ error: "Failed to save trades" });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
