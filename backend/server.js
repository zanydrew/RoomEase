const app = require("./src/app");
const { testConnection } = require("./src/config/db");

const PORT = process.env.PORT;

// Test DB connection on startup
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 RoomEase server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
  });
});
