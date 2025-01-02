const express = require("express");

const router = express.Router();

const { verifyJwtToken } = require("../helpers/authentication");

//controllers
const userController = require("../controllers/userController");
const artistController = require("../controllers/artistController");
const albumController = require("../controllers/albumController");
const trackController = require("../controllers/trackController")
const favouriteController = require("../controllers/favouriteController")

// userRoutes
router.post("/signup", userController.signUp);
router.post("/login", userController.login);
router.get("/logout", verifyJwtToken, userController.logout);
router.get("/users", verifyJwtToken, userController.retrieveUsers);
router.post("/users/add-user", verifyJwtToken, userController.addUser);
router.delete("/users/:id", verifyJwtToken, userController.deleteUser);
router.put(
  "/users/update-password",
  verifyJwtToken,
  userController.updatePassword
);

// artistRoutes
router.post("/artists/add-artist", verifyJwtToken, artistController.addArtist);
router.get("/artists", verifyJwtToken, artistController.retrieveArtists);
router.get("/artists/:id", verifyJwtToken, artistController.retrieveArtist);
router.put("/artists/:id", verifyJwtToken, artistController.updateArtist);
router.delete("/artists/:id", verifyJwtToken, artistController.deleteArtist);

// albumRoutes
router.post("/albums/add-album", verifyJwtToken, albumController.addAlbum);
router.get("/albums", verifyJwtToken, albumController.retrieveAlbums);
router.get("/albums/:id", verifyJwtToken, albumController.retrieveAlbum);
router.put("/albums/:id", verifyJwtToken, albumController.updateAlbum);
router.delete("/albums/:id", verifyJwtToken, albumController.deleteAlbum);

// trackRouter
router.post("/tracks/add-track",verifyJwtToken,trackController.addTrack)
router.get("/tracks",verifyJwtToken,trackController.retrieveTracks)
router.get("/tracks/:id",verifyJwtToken,trackController.retrieveTrack)
router.put("/tracks/:id",verifyJwtToken,trackController.updateTrack)
router.delete("/tracks/:id",verifyJwtToken,trackController.deleteTrack)

// favouriteRouter
router.post("/favorites/add-favorite",verifyJwtToken,favouriteController.addFavourite)
router.delete("/favorites/remove-favorite/:id",verifyJwtToken,favouriteController.deleteFavourite)
router.get("/favorites/:category",verifyJwtToken,favouriteController.retrieveFavourites)

module.exports = router;
