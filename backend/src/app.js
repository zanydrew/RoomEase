const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");

// dotenv.config();

const app = express();

// // ── Global Middleware ─────────────────────────────────────────
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:3000",
//     credentials: true,
//   }),
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ── API Routes ────────────────────────────────────────────────
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/users", require("./routes/user.routes"));
// app.use("/api/rooms", require("./routes/room.routes"));
// app.use("/api/favorites", require("./routes/favorite.routes"));
// app.use("/api/viewings", require("./routes/viewing.routes"));
// app.use("/api/conversations", require("./routes/conversation.routes"));
// app.use("/api/messages", require("./routes/message.routes"));
// app.use("/api/notifications", require("./routes/notification.routes"));
// app.use("/api/admin", require("./routes/admin.routes"));

// // ── Health check ──────────────────────────────────────────────
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// // ── 404 handler ───────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// // ── Global error handler ──────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error("❌ Server Error:", err.message);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

module.exports = app;
