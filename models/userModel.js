const mongoose = require("mongoose");

const user = new mongoose.Schema(
  {
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
      type: String,
      enum: ["admin", "viewer", "editor"], // Enum for role
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", user);
