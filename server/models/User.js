const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type:String,
      enum:["Student","Teacher"],
      required:true,
    },
    createdQuizzes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Quiz",
    },
    participatedQuizzes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Quiz",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
