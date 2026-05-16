const mongoose = require("mongoose");
const kafka = require("../config/kafka");
const Quiz = require("../models/Quiz");
const { clearPending } = require("../services/producer");

const consumer = kafka.consumer({
    groupId: "grading-workers",
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
});

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const gradeSubmission = async (studentId, quizId, answers, attempt = 1) => {
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            console.error(`[Worker] Quiz not found: ${quizId}`);
            return true;
        }

        const existingResponseIndex = quiz.responses.findIndex(
            (response) => response.student.toString() === studentId.toString()
        );

        if (existingResponseIndex >= 0) {
            console.log(`[Worker] Student ${studentId} already graded for quiz ${quizId}. Skipping.`);
            clearPending(studentId, quizId);
            return true;
        }

        let totalScore = 0;
        quiz.questions.forEach((question, index) => {
            const studentAnswer = answers[index];
            if (studentAnswer !== undefined && studentAnswer === question.correctIndex) {
                totalScore += question.marks || 1;
            }
        });

        quiz.responses.push({
            student: studentId,
            answers: answers,
            totalScore: totalScore,
            submittedAt: new Date(),
        });

        await quiz.save();

        clearPending(studentId, quizId);

        console.log(
            `[Worker] Graded: student=${studentId} quiz=${quizId} score=${totalScore}/${quiz.questions.reduce((s, q) => s + (q.marks || 1), 0)}`
        );
        return true; // success
    } catch (error) {
        console.error(`[Worker] Error grading (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
        if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS * attempt); // exponential backoff
            return gradeSubmission(studentId, quizId, answers, attempt + 1);
        }
        // All retries exhausted — log and return false (do NOT commit offset)
        console.error(`[Worker] FAILED after ${MAX_RETRIES} attempts. studentId=${studentId} quizId=${quizId}`);
        clearPending(studentId, quizId);
        return false;
    }
};

const startWorker = async () => {
    try {
        await consumer.connect();
        console.log("[Worker] Grading worker connected to Kafka");

        await consumer.subscribe({ topic: "quiz-submissions", fromBeginning: false });

        await consumer.run({
            autoCommit: false,
            eachMessage: async ({ topic, partition, message, heartbeat, commitOffsets }) => {
                let success = false;
                try {
                    const raw = message.value.toString();
                    const submission = JSON.parse(raw);
                    const { studentId, quizId, answers } = submission;

                    if (!studentId || !quizId || !answers) {
                        console.error("[Worker] Invalid submission message, skipping:", submission);
                        success = true;
                    } else {
                        success = await gradeSubmission(studentId, quizId, answers);
                    }
                } catch (error) {
                    console.error("[Worker] Uncaught error processing message:", error);
                    success = false;
                }

                if (success) {
                    await consumer.commitOffsets([
                        {
                            topic,
                            partition,
                            offset: (BigInt(message.offset) + 1n).toString(),
                        },
                    ]);
                }

                await heartbeat();
            },
        });
    } catch (error) {
        console.error("[Worker] Error starting grading worker:", error);
        throw error;
    }
};

const stopWorker = async () => {
    try {
        await consumer.disconnect();
        console.log("[Worker] Grading worker disconnected");
    } catch (error) {
        console.error("[Worker] Error stopping grading worker:", error);
    }
};

module.exports = {
    startWorker,
    stopWorker,
};