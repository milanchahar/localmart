const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDb = require("./config/db");
const socketManager = require("./utils/socket");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const customerRoutes = require("./routes/customerRoutes");
const agentRoutes = require("./routes/agentRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/agent", agentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "LocalMart API is running" });
});

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();
    socketManager.init(server);
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Server start failed", err.message);
    process.exit(1);
  }
};

startServer();
