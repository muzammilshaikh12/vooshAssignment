const mongoose = require("mongoose");

const album = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    year: {
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
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("album", album);
