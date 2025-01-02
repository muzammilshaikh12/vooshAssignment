const mongoose = require("mongoose");

const artist = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    grammy: {
      type: Number,
      required: true,
    },
    hidden: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("artist", artist);
