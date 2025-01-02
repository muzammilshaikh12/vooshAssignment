const artistModel = require("../models/artistModel");
const { asyncHandler, ApiResponse } = require("../helpers/structureHelpers");
const mongoose = require("mongoose");

exports.addArtist = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const { name, grammy, hidden } = req.body;
  if (!name || !grammy || hidden === undefined ) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  await artistModel.create({
    name,
    grammy,
    hidden,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, `Artist created successfully.`));
});

exports.retrieveArtists = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const offset = parseInt(req.query.offset) || 0;
  const filter = {};

  if (req.query.grammy) {
    filter.grammy = parseInt(req.query.grammy, 10);
  }

  if (req.query.hidden !== undefined) {
    filter.hidden = req.query.hidden === "true";
  }

  const filteredArtists = await artistModel
    .find(filter)
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .lean()
    .select("-password -__v -updatedAt");

  // using pagination separately, so that pagination should be applied only to filtered records
  const paginatedArtists = filteredArtists.slice(offset, offset + limit);

  return res
    .status(200)
    .json(
      new ApiResponse(200, `Artists retrieved successfully.`, paginatedArtists)
    );
});

exports.retrieveArtist = asyncHandler(async (req, res) => {
  const artistId = req.params.id;
  if (!artistId || !mongoose.Types.ObjectId.isValid(artistId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const artistData = await artistModel
    .findById(artistId)
    .lean()
    .select("-password -__v -updatedAt");
  if (!artistData) {
    return res.status(404).json(new ApiResponse(404, `Artist Not Found`));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, `Artist retrieved successfully.`, artistData));
});

exports.updateArtist = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const artistId = req.params.id;
  if (!artistId || !mongoose.Types.ObjectId.isValid(artistId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }
  const { name, grammy, hidden } = req.body;
  if (!name && !grammy && hidden === undefined) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const artistCheck = await artistModel.findById(artistId);
  if (!artistCheck) {
    return res.status(404).json(new ApiResponse(404, `Artist Not Found`));
  }
  let updatingFields = {};
  if (name) updatingFields.name = name;
  if (grammy) updatingFields.grammy = grammy;
  if (hidden !== undefined || hidden !== null) updatingFields.hidden = hidden;

  await artistModel.findByIdAndUpdate(artistId, updatingFields);
  return res
    .status(204)
    .json(new ApiResponse(204, `Artist updated successfully.`));
});

exports.deleteArtist = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const artistId = req.params.id;
  if (!artistId || !mongoose.Types.ObjectId.isValid(artistId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const artistCheck = await artistModel.findById(artistId);
  if (!artistCheck) {
    return res.status(404).json(new ApiResponse(404, `Artist Not Found`));
  }

  await artistModel.findByIdAndDelete(artistId);
  return res.status(200).json(
    new ApiResponse(200, `Artist:${artistCheck.name} deleted successfully.`, {
      artist_id: req.params.id,
    })
  );
});
