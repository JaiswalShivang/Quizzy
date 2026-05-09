const express = require("express");
const router = express.Router();
const { isAuth, isStudent, isTeacher } = require("../middlewares/auth");
const subCtrl = require("../controllers/subscriptionController");

router.post("/request", isAuth, isStudent, subCtrl.requestSubscription);
router.get("/requests", isAuth, isTeacher, subCtrl.getPendingRequests);
router.post("/respond", isAuth, isTeacher, subCtrl.respondToRequest);
router.get("/my", isAuth, isStudent, subCtrl.getMySubscriptions);

module.exports = router;