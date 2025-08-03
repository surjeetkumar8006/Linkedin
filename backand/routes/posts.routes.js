import express from "express";
import { activeCheck, createPost, getAllPost, deletePost, commentPost, incrementPostLikes, getPostComments,getPostsByUser } from "../controllers/post.controller.js";
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

router.route("/").get(activeCheck);
router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPost);
router.route("/post/delete").post(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").post(getPostComments);
router.route("/delete_comment").post(deletePost);
router.route("/increment_post_like").post(incrementPostLikes);

router.route("/get_by_user").post(getPostsByUser);


export default router;
