const Post = require("../models/Post");

class PostService {
  // Get all posts
  async getAllPosts() {
    return await Post.find().sort({ date: -1 });
  }

  // Get single post by ID
  async getPostById(id) {
    return await Post.findById(id);
  }

  // Create a new post
  async createPost(postData) {
    const post = new Post(postData);
    return await post.save();
  }

  // Update existing post
  async updatePost(id, postData) {
    return await Post.findByIdAndUpdate(id, postData, { new: true });
  }

  // Delete post
  async deletePost(id) {
    return await Post.findByIdAndDelete(id);
  }

  // Add a comment to a post
  async addComment(postId, comment) {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");
    post.comments.push(comment);
    await post.save();
    return post;
  }
}

module.exports = new PostService();
