const mongoose = require("mongoose");

const track = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    hidden: {
      type: Boolean,
      required: true,
    },
    artistId : {
        type:String,
        required:true
    },
    albumId : {
        type:String,
        required:true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("track", track);
