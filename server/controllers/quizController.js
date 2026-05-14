const Quiz = require("../models/Quiz");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const mongoose = require("mongoose");
const { publishSubmission } = require("../services/producer");

exports.createQuiz = async (req, res) => {
  try {
    const { title, questions, isOpen } = req.body;
    const teacherId = req.user.id;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title and at least one question are required",
      });
    }

    const newQuiz = await Quiz.create({
      title,
      isOpen: isOpen ?? false,
      questions,
      teacher: teacherId,
    });

    await User.findByIdAndUpdate(teacherId, {
      $push: { createdQuizzes: newQuiz._id },
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating quiz",
    });
  }
};

exports.getAllQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let query = {};

    if (user.role === "Teacher") {
      query.teacher = userId;
    } else if (user.role === "Student") {
      // Get approved subscriptions
      const subscriptions = await Subscription.find({
        student: userId,
        status: "approved",
      });
      const teacherIds = subscriptions.map(sub => sub.teacher);
      if (teacherIds.length > 0) {
        query.teacher = { $in: teacherIds };
      } else {
        // If no approved subscriptions, return empty array
        return res.status(200).json({
          success: true,
          quizzes: [],
        });
      }
    }

    const quizzes = await Quiz.find(query)
      .populate("teacher", "name email")
      .select("-responses");

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    console.error("Get all quizzes error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching quizzes",
    });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id)
      .populate("teacher", "name email")
      .populate("responses.student", "name email");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }
    const userSubmission = quiz.responses.find(response =>
      response.student._id.toString() === userId.toString()
    );

    const totalMarks = quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    return res.status(200).json({
      success: true,
      quiz,
      userSubmission: userSubmission ? {
        totalScore: userSubmission.totalScore,
        maxScore: totalMarks,
        submittedAt: userSubmission.submittedAt,
        hasSubmitted: true
      } : {
        hasSubmitted: false
      }
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching quiz",
    });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const studentId = req.user.id;
    const { answers = [] } = req.body;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }
    if (!quiz.isOpen) {
      return res.status(403).json({
        success: false,
        message: "Quiz is closed",
      });
    }

    const existingSubmission = quiz.responses.find(response =>
      response.student.toString() === studentId.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this quiz",
        data: {
          alreadySubmitted: true,
          score: existingSubmission.totalScore,
          submittedAt: existingSubmission.submittedAt
        }
      });
    }

    await publishSubmission(studentId, quizId, answers);

    return res.status(202).json({
      message: "Submission received successfully! Your score is being calculated."
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while submitting quiz",
      error: error.message,
    });
  }
};

exports.toggleQuizStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quiz.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own quizzes",
      });
    }

    quiz.isOpen = !quiz.isOpen;
    await quiz.save();

    return res.status(200).json({
      success: true,
      message: `Quiz ${quiz.isOpen ? "opened" : "closed"} successfully`,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        isOpen: quiz.isOpen,
      },
    });
  } catch (error) {
    console.error("Toggle quiz status error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while updating quiz status",
    });
  }
};
