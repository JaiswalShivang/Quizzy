const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL)
    .then(()=>console.log("Database connected"))
    .catch((err)=>console.log(err));
  } catch (error) {
    process.exit(1);
  }
}

module.exports = dbConnect;