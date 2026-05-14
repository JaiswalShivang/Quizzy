const mongoose = require("mongoose");
const kafka = require("../config/kafka");
const Quiz = require("../models/Quiz");

const consumer = kafka.consumer({ groupId: "grading-workers" });

const gradeSubmission = async (studentId, quizId, answers) => {
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            console.error(`Quiz not found: ${quizId}`);
            return;
        }

        let totalScore = 0;

        quiz.questions.forEach((question, index) => {
            const studentAnswer = answers[index];
            if (studentAnswer !== undefined && studentAnswer === question.correctIndex) {
                totalScore += question.marks || 1; 
            }
        });

        const existingResponseIndex = quiz.responses.findIndex(
            response => response.student.toString() === studentId.toString()
        );

        if (existingResponseIndex >= 0) {
            console.log(`Student ${studentId} already graded for quiz ${quizId}. Skipping.`);
            return;
        }

        quiz.responses.push({
            student: studentId,
            answers: answers,
            totalScore: totalScore,
            submittedAt: new Date()
        });

        await quiz.save();
        console.log(`Graded submission for student ${studentId} on quiz ${quizId}. Score: ${totalScore}`);

    } catch (error) {
        console.error("Error grading submission:", error);
    }
};

const startWorker = async () => {
    try {
        await consumer.connect();
        console.log("Grading worker connected to Kafka");

        await consumer.subscribe({ topic: "quiz-submissions", fromBeginning: false });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const submission = JSON.parse(message.value.toString());

                    const { studentId, quizId, answers } = submission;

                    if (!studentId || !quizId || !answers) {
                        console.error("Invalid submission message:", submission);
                        return;
                    }

                    await gradeSubmission(studentId, quizId, answers);

                } catch (error) {
                    console.error("Error processing message:", error);
                }
            },
        });

    } catch (error) {
        console.error("Error starting grading worker:", error);
    }
};

const stopWorker = async () => {
    try {
        await consumer.disconnect();
        console.log("Grading worker disconnected");
    } catch (error) {
        console.error("Error stopping grading worker:", error);
    }
};

module.exports = {
    startWorker,
    stopWorker
};