const express = require("express");
const router = express.Router();
const { isAuth, isStudent, isTeacher } = require("../middlewares/auth");
const quizCtrl = require("../controllers/quizController");

router.post("/create", isAuth, isTeacher, quizCtrl.createQuiz);

router.post("/:id/submit", isAuth, isStudent, quizCtrl.submitQuiz);

router.patch("/:id/toggle-status", isAuth, isTeacher, quizCtrl.toggleQuizStatus);

router.get("/", isAuth, quizCtrl.getAllQuiz);

router.get("/:id", isAuth, quizCtrl.getQuiz);

// Test endpoint to verify authentication
router.get("/test/auth", isAuth, (req, res) => {
  res.json({
    success: true,
    message: "Authentication working",
    user: req.user
  });
});

module.exports = router;