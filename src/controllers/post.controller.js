
const postService = require("../services/post.service");

exports.like = async (req, res) => {
  try {
    const userUid = req.user.uid; // Get user UID from Firebase auth middleware
    const result = await postService.likePost(req.params.id, userUid);
    if (!result.post) return res.status(404).json({ error: "Post not found" });
    
    if (result.alreadyLiked) {
      return res.status(400).json({ error: "You have already liked this post" });
    }
    
    res.json(result.post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unlike = async (req, res) => {
  try {
    const userUid = req.user.uid; // Get user UID from Firebase auth middleware
    const result = await postService.unlikePost(req.params.id, userUid);
    if (!result.post) return res.status(404).json({ error: "Post not found" });
    
    if (result.notLiked) {
      return res.status(400).json({ error: "You haven't liked this post yet" });
    }
    
    res.json(result.post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkLikeStatus = async (req, res) => {
  try {
    const userUid = req.user.uid;
    const hasLiked = await postService.hasUserLikedPost(req.params.id, userUid);
    res.json({ hasLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    // Add ownerUid from authenticated user
    const postData = { 
      ...req.body, 
      imageUrl,
      ownerUid: req.user.uid // From Firebase auth middleware
    };
    const post = await postService.createPost(postData);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const posts = await postService.getPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await postService.getPostsByOwner(req.user.uid);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    // Check if user owns the post or is admin
    const existingPost = await postService.getPostById(req.params.id);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (existingPost.ownerUid !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "You can only update your own posts" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    const post = await postService.updatePost(req.params.id, { ...req.body, imageUrl });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    // Check if user owns the post or is admin
    const existingPost = await postService.getPostById(req.params.id);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (existingPost.ownerUid !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    await postService.deletePost(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { user, text } = req.body;
    if (!user || !text) {
      return res.status(400).json({ error: "Missing user or text in comment." });
    }
    const post = await postService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    const comment = { user, text };
    const updatedPost = await postService.addComment(req.params.id, comment);
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
