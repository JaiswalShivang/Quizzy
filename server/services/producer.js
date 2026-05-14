const kafka = require("../config/kafka");

const producer = kafka.producer();
const admin = kafka.admin();

const connectProducer = async () => {
    await producer.connect();
    console.log("Kafka Producer connected");

    // Create topic if it doesn't exist
    await admin.connect();
    try {
        await admin.createTopics({
            topics: [{
                topic: 'quiz-submissions',
                numPartitions: 1,
                replicationFactor: 1
            }],
            waitForLeaders: true
        });
        console.log("Kafka topic 'quiz-submissions' created or already exists");
    } catch (error) {
        if (error.type !== 'TOPIC_ALREADY_EXISTS') {
            console.error("Error creating Kafka topic:", error);
        }
    } finally {
        await admin.disconnect();
    }
};

const publishSubmission = async (studentId , quizId, answers) => {
    const payload = JSON.stringify({
        studentId,
        quizId,
        answers,
        timestamp: Date.now()
    });

    await producer.send({
        topic: "quiz-submissions",
        messages: [
            { value: payload }
        ]
    });
}

module.exports = {
    connectProducer,
    publishSubmission
}