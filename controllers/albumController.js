const artistModel = require("../models/artistModel");
const albumModel = require("../models/albumModel");
const { asyncHandler, ApiResponse } = require("../helpers/structureHelpers");
const mongoose = require("mongoose");

exports.addAlbum = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const { artist_id, name, year, hidden } = req.body;
  if (
    !artist_id ||
    !name ||
    !year ||
    hidden === undefined ||
    !mongoose.Types.ObjectId.isValid(artist_id)
  ) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const artistCheck = await artistModel.findById(artist_id);
  if (!artistCheck) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist.`));
  }

  await albumModel.create({
    artistId: artist_id,
    name,
    year,
    hidden,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, `Album created successfully.`));
});

exports.retrieveAlbums = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const offset = parseInt(req.query.offset) || 0;
  const filter = {};

  if (req.query.artist_id) {
    if (!mongoose.Types.ObjectId.isValid(req.query.artist_id)) {
      return res.status(400).json(new ApiResponse(400, `Bad Request`));
    }

    const artistCheck = await artistModel.findById(req.query.artist_id);
    if (!artistCheck) {
      return res
        .status(404)
        .json(new ApiResponse(404, `Artist not found, not valid artist ID.`));
    }

    filter.artistId = req.query.artist_id;
  }

  if (req.query.hidden !== undefined) {
    filter.hidden = req.query.hidden === "true";
  }

  const albumData = await albumModel
    .find(filter)
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .lean()
    .select("-__v -updatedAt -createdAt");

  // using pagination separately, so that pagination should be applied only to filtered records
  const paginatedAlbumData = albumData.slice(offset, offset + limit);

  return res
    .status(200)
    .json(
      new ApiResponse(200, `Albums retrieved successfully.`, paginatedAlbumData)
    );
});

exports.retrieveAlbum = asyncHandler(async (req, res) => {
  const albumId = req.params.id;
  if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const albumData = await albumModel
    .findById(albumId)
    .lean()
    .select("-createdAt -updatedAt -__v");
  if (!albumData) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist.`));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, `Album retrieved successfully.`, albumData));
});

exports.updateAlbum = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const albumId = req.params.id;
  if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }
  const { name, year, hidden } = req.body;
  if (!name && !year && hidden === undefined) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const albumCheck = await albumModel.findById(albumId);
  if (!albumCheck) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist.`));
  }
  let updatingFields = {};
  if (name) updatingFields.name = name;
  if (year) updatingFields.year = year;
  if (hidden !== undefined || hidden !== null) updatingFields.hidden = hidden;

  await albumModel.findByIdAndUpdate(albumId, updatingFields);
  return res
    .status(204)
    .json(new ApiResponse(204, `Album updated successfully.`));
});

exports.deleteAlbum = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const albumId = req.params.id;
  if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const albumCheck = await albumModel.findById(albumId);
  if (!albumCheck) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist:`));
  }

  await albumModel.findByIdAndDelete(albumId);
  return res
    .status(200)
    .json(
      new ApiResponse(200, `Artist:${albumCheck.name} deleted successfully.`)
    );
});
