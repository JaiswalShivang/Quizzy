const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectProducer = require("./services/producer").connectProducer;
const disconnectProducer = require("./services/producer").disconnectProducer;
const { startWorker, stopWorker } = require("./worker/gradingWorker");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const dbConnect = require("./config/database");
dbConnect();

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoute");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/subscription", subscriptionRoutes);

const PORT = 3000;

connectProducer().catch((err) => {
  console.error("Failed to connect Kafka Producer:", err);
  process.exit(1);
});

startWorker().catch((err) => {
  console.error("Failed to start grading worker:", err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await stopWorker();
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await stopWorker();
  await disconnectProducer();
  process.exit(0);
});