import express from "express";
import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfile,
  downloadProfile,
  sendConnectionRequest,
  getMyConnectionRequest,
  whatAreMyConnections,
  acceptConnectionRequest,
  getProfileById
} from "../controllers/user.controller.js";
import multer from "multer";
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.post(
  "/upload_profile_picture",
  upload.single("profile_picture"),
  uploadProfilePicture
);
router.post("/register", register);
router.post("/login", login);
router.post("/user_update", updateUserProfile);
router.get("/get_user_and_profile", getUserAndProfile);
router.post("/update_profile_data", updateProfileData);
router.get("/get_all_user_profile", getAllUserProfile);
router.get("/user/download_resume", downloadProfile);
router.post("/user/send_connection_request", sendConnectionRequest);
router.get("/user/get_connection_request", getMyConnectionRequest);
router.get("/user/what_are_my_connections", whatAreMyConnections);
router.post("/user/accept_connection_request", acceptConnectionRequest);

router.route("/get_profile_by_id").post(getProfileById);

export default router;
