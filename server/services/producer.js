const { json } = require("express");
const kafka = require("../config/kafka");

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log("Kafka Producer connected");
};

const publishSubmission = async (studentId , quizId, answers) => {
    const payload = json.stringify({
        studentId,
        quizId,
        answers,
        timestamps: Date.now()
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