const artistModel = require("../models/artistModel");
const albumModel = require("../models/albumModel");
const trackModel = require("../models/trackModel");
const { asyncHandler, ApiResponse } = require("../helpers/structureHelpers");
const mongoose = require("mongoose");

exports.addTrack = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const { artist_id, name, duration, hidden, album_id } = req.body;
  if (
    !artist_id ||
    !name ||
    !duration ||
    !album_id ||
    hidden === undefined ||
    !mongoose.Types.ObjectId.isValid(artist_id) ||
    !mongoose.Types.ObjectId.isValid(album_id)
  ) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const artistCheck = await artistModel.findById(artist_id);
  const albumCheck = await albumModel.findById(album_id);
  if (!artistCheck || !albumCheck) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist.`));
  }

  if (albumCheck.artistId !== artist_id) {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }

  await trackModel.create({
    name,
    duration,
    hidden,
    artistId: artist_id,
    albumId: album_id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, `Track created successfully.`));
});

exports.retrieveTracks = asyncHandler(async (req, res) => {
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

  if (req.query.album_id) {
    if (!mongoose.Types.ObjectId.isValid(req.query.album_id)) {
      return res.status(400).json(new ApiResponse(400, `Bad Request`));
    }

    const albumCheck = await albumModel.findById(req.query.album_id);
    if (!albumCheck) {
      return res
        .status(404)
        .json(new ApiResponse(404, `Album not found, not valid Album ID.`));
    }

    filter.albumId = req.query.album_id;
  }

  if (req.query.hidden !== undefined) {
    filter.hidden = req.query.hidden === "true";
  }

  const trackData = await trackModel
    .find(filter)
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .lean()
    .select("-__v -updatedAt -createdAt");

  for (let track of trackData) {
    const [artistName, albumName] = await Promise.all([
      artistModel.findById(track.artistId).lean(),
      albumModel.findById(track.albumId).lean(),
    ]);

    // Add artist and album names to the track object
    track.artist_name = artistName ? artistName.name : "Unknown Artist";
    track.album_name = albumName ? albumName.name : "Unknown Album";
    delete track.artistId;
    delete track.albumId;
  }

  // using pagination separately, so that pagination should be applied only to filtered records
  const paginatedTrackData = trackData.slice(offset, offset + limit);

  return res
    .status(200)
    .json(
      new ApiResponse(200, `Tracks retrieved successfully.`, paginatedTrackData)
    );
});

exports.retrieveTrack = asyncHandler(async (req, res) => {
  const trackId = req.params.id;
  if (!trackId || !mongoose.Types.ObjectId.isValid(trackId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const trackData = await trackModel
    .findById(trackId)
    .lean()
    .select("-createdAt -updatedAt -__v");
  if (!trackData) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist.`));
  }

  const artistName = await artistModel.findById(trackData.artistId);
  const albumName = await albumModel.findById(trackData.albumId);
  trackData.artist_name = artistName.name;
  trackData.album_name = albumName.name;
  delete trackData.artistId;
  delete trackData.albumId;
  return res
    .status(200)
    .json(new ApiResponse(200, `Track retrieved successfully.`, trackData));
});

exports.updateTrack = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const trackId = req.params.id;
  if (!trackId || !mongoose.Types.ObjectId.isValid(trackId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }
  const { name, duration, hidden } = req.body;
  if (!name && !duration && hidden === undefined) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const trackCheck = await trackModel.findById(trackId);
  if (!trackCheck) {
    return res
      .status(404)
      .json(new ApiResponse(404, `Resource Doesn't Exist.`));
  }
  let updatingFields = {};
  if (name) updatingFields.name = name;
  if (duration) updatingFields.duration = duration;
  if (hidden) updatingFields.hidden = hidden;

  await trackModel.findByIdAndUpdate(trackId, updatingFields);
  return res
    .status(204)
    .json(new ApiResponse(204, `Track updated successfully.`));
});


exports.deleteTrack = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const trackId = req.params.id;
  if (!trackId || !mongoose.Types.ObjectId.isValid(trackId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const trackCheck = await trackModel.findById(trackId);
  if (!trackCheck) {
    return res.status(404).json(new ApiResponse(404, `Resource Doesn't Exist:`));
  }

  await trackModel.findByIdAndDelete(trackId);
  return res
    .status(200)
    .json(
      new ApiResponse(200, `Track:${trackCheck.name} deleted successfully.`)
    );
});

