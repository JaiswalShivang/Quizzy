const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    questions: [
      {
        title: String,
        answer: [String],
        correctIndex: Number,
        marks: Number,
      },
    ],
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responses: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        answers: [Number],
        totalScore: Number,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Quiz",quizSchema);