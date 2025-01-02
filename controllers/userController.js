const userModel = require("../models/userModel");
const { asyncHandler, ApiResponse } = require("../helpers/structureHelpers");
const mongoose = require("mongoose");
const {
  hashPassword,
  verifyPassword,
  generateToken,
} = require("../helpers/authentication");

exports.signUp = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res
      .status(400)
      .json(new ApiResponse(400, `Bad Request, Reason:Email`));
  }
  if (!password) {
    return res
      .status(400)
      .json(new ApiResponse(400, `Bad Request, Reason:Password`));
  }

  const userCheck = await userModel.findOne({ email }).lean();
  if (userCheck) {
    return res.status(409).json(new ApiResponse(409, `Email already exists.`));
  }

  const firstUserCheck = await userModel.find().lean();
  if (firstUserCheck.length !== 0) {
    return res.status(409).json(new ApiResponse(409, `Admin already exists.`));
  }

  const hashedPassword = await hashPassword(password);

  await userModel.create({
    email,
    password: hashedPassword,
    role: "admin",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully."));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res
      .status(400)
      .json(new ApiResponse(400, `Bad Request, Reason:Email`));
  }
  if (!password) {
    return res
      .status(400)
      .json(new ApiResponse(400, `Bad Request, Reason:Password`));
  }

  const userCheck = await userModel.findOne({ email }).lean();
  if (!userCheck) {
    return res.status(404).json(new ApiResponse(404, `User not found`));
  }

  const passwordVerification = await verifyPassword(
    password,
    userCheck.password
  );

  if (passwordVerification) {
    const token = generateToken(
      { id: userCheck._id, role: userCheck.role },
      process.env.secretkey || `2d7c4b8e9f3a1d5c6b2e8f4a7d9c3b5a`
    );
    return res
      .status(200)
      .json(new ApiResponse(200, `Login successful.`, { token }));
  } else {
    return res.status(401).json(new ApiResponse(401, `Incorrect Passowrd`));
  }
});

exports.logout = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const userCheck = await userModel.findById({
    id,
  });

  if (userCheck) {
    return res
      .status(200)
      .json(new ApiResponse(200, `User logged out successfully`));
  }
});

exports.retrieveUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const limit = req.query.limit || 5;
  const offset = req.query.offset || 0;
  const role = req.query.role;
  let filter = { role: { $ne: "admin" } };
  if (role) {
    role === "Editor"
      ? (filter = { role: "editor" })
      : (filter = { role: "viewer" });
  }
  const userDetails = await userModel
    .find(filter)
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .lean()
    .select("-password -__v -updatedAt");

  // using pagination separately, so that pagination should be applied only to filtered records
  const paginatedUserDetails = userDetails.slice(offset, limit + offset);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Users retrieved successfully.`,
        paginatedUserDetails
      )
    );
});

exports.addUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const { email, password, role } = req.body;
  if (!email || !password || !role || role === "admin") {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const emailCheck = await userModel.findOne({ email }).lean();
  if (emailCheck) {
    return res.status(409).json(new ApiResponse(409, `Email already exists`));
  }

  const hashedPassword = await hashPassword(password);

  await userModel.create({
    email,
    password: hashedPassword,
    role,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully."));
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const userId = req.params.id;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const userCheck = await userModel.findById(userId).lean();
  if (!userCheck) {
    return res.status(404).json(new ApiResponse(404, `User not found.`));
  }

  if (userCheck.role === "admin") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }

  await userModel.findByIdAndDelete(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, "User deleted successfully."));
});

exports.updatePassword = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "editor") {
    return res
      .status(403)
      .json(new ApiResponse(403, `Forbidden Access/Operation not allowed.`));
  }
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json(new ApiResponse(400, `Bad Request`));
  }

  const userCheck = await userModel.findById(req.user.id).lean();
  if (!userCheck) {
    return res.status(404).json(new ApiResponse(404, `User not found.`));
  }

  const currentPasswordVerification = await verifyPassword(
    old_password,
    userCheck.password
  );

  if (!currentPasswordVerification) {
    return res.status(401).json(new ApiResponse(401, `Unauthorized Access`));
  }

  const hashedPassword = await hashPassword(new_password);

  await userModel.findByIdAndUpdate(req.user.id, { password: hashedPassword });

  return res
    .status(204)
    .json(new ApiResponse(204, `Password updated successfully`));
});
