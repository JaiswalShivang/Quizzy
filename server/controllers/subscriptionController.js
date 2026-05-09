const Subscription = require("../models/Subscription");
const User = require("../models/User");

exports.requestSubscription = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const studentId = req.user.id;

    if (req.user.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only students can request subscriptions",
      });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "Teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Check if subscription already exists
    const existingSub = await Subscription.findOne({
      student: studentId,
      teacher: teacherId,
    });

    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: "Subscription request already exists",
      });
    }

    const subscription = await Subscription.create({
      student: studentId,
      teacher: teacherId,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription request sent",
      subscription,
    });
  } catch (error) {
    console.error("Request subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Error requesting subscription",
    });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({
        success: false,
        message: "Only teachers can view requests",
      });
    }

    const requests = await Subscription.find({
      teacher: req.user.id,
      status: "pending",
    }).populate("student", "name email");

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching requests",
    });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { subscriptionId, action } = req.body; // action: 'approve' or 'reject'

    if (req.user.role !== "Teacher") {
      return res.status(403).json({
        success: false,
        message: "Only teachers can respond to requests",
      });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription request not found",
      });
    }

    if (subscription.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only respond to your own requests",
      });
    }

    subscription.status = action === "approve" ? "approved" : "rejected";
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: `Request ${action}d`,
      subscription,
    });
  } catch (error) {
    console.error("Respond to request error:", error);
    return res.status(500).json({
      success: false,
      message: "Error responding to request",
    });
  }
};

exports.getMySubscriptions = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view subscriptions",
      });
    }

    const subscriptions = await Subscription.find({
      student: req.user.id,
      status: "approved",
    }).populate("teacher", "name email");

    return res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
    });
  }
};