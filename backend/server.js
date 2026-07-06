const app = require("./src/app");
const { sequelize } = require("./src/models");
const PORT = process.env.PORT || 5000;

// Prevent the server from crashing on unhandled errors
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
});

sequelize
  .sync({ alter: false }) // Use { force: true } to drop and recreate tables, or { alter: true } to update tables without dropping
  .then(() => {
    console.log("✅ MySQL connected successfully");
    app.listen(PORT, () => {
      console.log(
        `🚀 ${process.env.DB_NAME} server running on http://localhost:${PORT}`,
      );
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  });
