exports.likePost = async (id, userUid) => {
  const post = await Post.findById(id);
  if (!post) {
    return { post: null };
  }
  
  // Check if user has already liked this post
  if (post.likedBy.includes(userUid)) {
    return { post, alreadyLiked: true };
  }
  
  // Add user to likedBy array and increment like count
  post.likedBy.push(userUid);
  post.likeCount += 1;
  
  const updatedPost = await post.save();
  return { post: updatedPost, alreadyLiked: false };
};

exports.unlikePost = async (id, userUid) => {
  const post = await Post.findById(id);
  if (!post) {
    return { post: null };
  }
  
  // Check if user has actually liked this post
  const likedIndex = post.likedBy.indexOf(userUid);
  if (likedIndex === -1) {
    return { post, notLiked: true };
  }
  
  // Remove user from likedBy array and decrement like count
  post.likedBy.splice(likedIndex, 1);
  post.likeCount = Math.max(0, post.likeCount - 1); // Ensure count doesn't go below 0
  
  const updatedPost = await post.save();
  return { post: updatedPost, notLiked: false };
};

exports.hasUserLikedPost = async (postId, userUid) => {
  const post = await Post.findById(postId);
  if (!post) {
    return false;
  }
  return post.likedBy.includes(userUid);
};
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
  if (!post) {
    throw new Error('Post not found');
  }
  if (!Array.isArray(post.comments)) {
    post.comments = [];
  }
  post.comments.push(comment);
  try {
    return await post.save();
  } catch (err) {
    console.error('Error saving comment:', err);
    throw err;
  }
};
