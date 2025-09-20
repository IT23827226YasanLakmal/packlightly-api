const Post = require("../models/Post");

exports.createPost = async (data) => {
  const post = new Post(data);
  return await post.save();
};

exports.getPosts = async () => {
  return await Post.find().sort({ date: -1 });
};

exports.getPostsByOwner = async (ownerUid) => {
  return await Post.find({ ownerUid }).sort({ date: -1 });
};

exports.getPostById = async (id) => {
  return await Post.findById(id);
};

exports.updatePost = async (id, data) => {
  return await Post.findByIdAndUpdate(id, data, { new: true });
};

exports.deletePost = async (id) => {
  return await Post.findByIdAndDelete(id);
};

exports.addComment = async (postId, comment) => {
  const post = await Post.findById(postId);
  post.comments.push(comment);
  return await post.save();
};
