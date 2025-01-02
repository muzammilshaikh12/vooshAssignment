const mongoose = require("mongoose");

const favourite = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    item_id : {
        type:String,
        required:true
    },
    userId : {
        type:String,
        required:true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("favourite", favourite);
