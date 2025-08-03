import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  body: {
    type: String,
    required: true,
  },
  likes: [{ // Array of user IDs who liked the post
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  media: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: true,
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
  }
});

// Export the Post model
const Post = mongoose.model("Post", postSchema);
export default Post;
