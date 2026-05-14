const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "quizzy-app",
  brokers: ["localhost:9092"],
});

module.exports = kafka;