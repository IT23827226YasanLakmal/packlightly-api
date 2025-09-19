const postService = require("../services/post.service");

class PostController {
  async getAll(req, res) {
    try {
      const posts = await postService.getAllPosts();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getOne(req, res) {
    try {
      const post = await postService.getPostById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const newPost = await postService.createPost(req.body);
      res.status(201).json(newPost);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const updatedPost = await postService.updatePost(req.params.id, req.body);
      if (!updatedPost) return res.status(404).json({ error: "Post not found" });
      res.json(updatedPost);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const deletedPost = await postService.deletePost(req.params.id);
      if (!deletedPost) return res.status(404).json({ error: "Post not found" });
      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async addComment(req, res) {
    try {
      const { user, text } = req.body;
      if (!user || !text) return res.status(400).json({ error: "Missing comment data" });
      const post = await postService.addComment(req.params.id, { user, text });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new PostController();
