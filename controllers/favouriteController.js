const artistModel = require("../models/artistModel");
const albumModel = require("../models/albumModel");
const trackModel = require("../models/trackModel");
const { asyncHandler, ApiResponse } = require("../helpers/structureHelpers");
const mongoose = require("mongoose");
const favouriteModel = require("../models/favouriteModel");

exports.addFavourite = asyncHandler(async (req, res) => {
  const { category, item_id } = req.body;
  if (!category || !item_id || !mongoose.Types.ObjectId.isValid(item_id)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const favouriteCheck = await favouriteModel.findOne({item_id}).lean()
  if(favouriteCheck) {
    return res.status(409).json(new ApiResponse(409, `Favourite already exists.`));
  }

  const validTypes = ["artist", "album", "track"];
  if (!validTypes.includes(category)) {
    return res.status(400).json(new ApiResponse(400, "Invalid item type"));
  }

  let itemModel;
  if (category === "artist") itemModel = artistModel;
  if (category === "album") itemModel = albumModel;
  if (category === "track") itemModel = trackModel;

  const item = await itemModel.findById(item_id);
  if (!item) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist.`));
  }

  await favouriteModel.create({
    category,
    item_id,
    userId: req.user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, `Favorite added successfully.`));
});

exports.deleteFavourite = asyncHandler(async (req, res) => {
  const favouriteId = req.params.id;
  if (!favouriteId || !mongoose.Types.ObjectId.isValid(favouriteId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const favouriteCheck = await favouriteModel.findById(favouriteId);
  if (!favouriteCheck) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist.`));
  }

  await favouriteModel.findByIdAndDelete(favouriteId);
  return res
    .status(200)
    .json(new ApiResponse(200, `Favorite removed successfully.`));
});

exports.retrieveFavourites = asyncHandler(async (req, res) => {
  const category = req.params.category;
  const validTypes = ["artist", "album", "track"];
  if (!category || !validTypes.includes(category)) {
    return res.status(400).json(new ApiResponse(400, "Invalid item type"));
  }
  const limit = req.query.limit || 5;
  const offset = req.query.offset || 0;

  const favouritesData = await favouriteModel
    .find({ userId: req.user.id, category })
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .lean()
    .select("-__v -updatedAt -userId");
  if (category === "artist") itemModel = artistModel;
  if (category === "album") itemModel = albumModel;
  if (category === "track") itemModel = trackModel;
  for (let i = 0; i < favouritesData.length; i++) {
     const itemName = await itemModel.findById(favouritesData[i].item_id).lean()
     favouritesData[i].name = itemName.name 
     favouritesData[i].favorite_id = favouritesData[i]._id 
     delete favouritesData[i]._id
  }

  return res
    .status(200)
    .json(new ApiResponse(200, `Favorites retrieved successfully.`,favouritesData));
});
