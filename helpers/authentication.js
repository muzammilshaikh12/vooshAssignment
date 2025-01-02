const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ApiError, ApiResponse, asyncHandler } = require("./structureHelpers");

exports.hashPassword = async (password) => {
  try {
    const saltRounds = parseInt(process.env.hashSalt, 10);
    if (isNaN(saltRounds)) {
      throw new Error("HASH_SALT environment variable must be a number");
    }
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new ApiError(500, `Something went wrong - ${error.message}`);
  }
};

exports.verifyPassword = async (password, hashPassword) => {
  try {
    return await bcrypt.compare(password, hashPassword);
  } catch (error) {
    throw new ApiError(500, `Something went wrong - ${error.message}`);
  }
};

exports.generateToken = (
  payload,
  secretKey,
  options = { expiresIn: process.env.authTokenExpiry }
) => {
  // payload must be an object
  try {
    return jwt.sign(payload, secretKey, options);
  } catch (error) {
    throw new ApiError(500, `Something went wrong - ${error.message}`);
  }
};

exports.verifyJwtToken = (req, res, next) => {
  try {
    let token = req.headers["authorization"];

    if (!token) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Bad Request:Authorization Token"));
    }

    token = token.split(" ");
    if (token[0] !== "Bearer" || !token[1]) {
      return res
        .status(401)
        .json(
          new ApiResponse(401, "Unauthorized Access", {
            errorType: "authTokenInvalid",
          })
        );
    }
    token = token[1];
    const user = jwt.verify(token, process.env.secretKey);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, "Auth token expired", {
            errorType: "authTokenExpired",
          })
        );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json(
          new ApiResponse(401, "Unauthorized Access", {
            errorType: "authTokenInvalid",
          })
        );
    }
    const status = error.status || 500;
    return res
      .status(status)
      .json(new ApiResponse(status, error.message || "Internal Server Error"));
  }
};
