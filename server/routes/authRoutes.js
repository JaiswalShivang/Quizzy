const express = require("express");
const router = express.Router();
const {login,signup, getTeachers} = require("../controllers/userController");
const { isAuth } = require("../middlewares/auth");

router.post("/login",login);

router.post("/signup",signup);

router.get("/teachers", isAuth, getTeachers);

module.exports = router;