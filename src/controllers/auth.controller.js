exports.getProfile = (req, res) => {
  // `req.user` is available because of the authenticateFirebase middleware
  res.json({
    message: 'User profile data fetched successfully',
    user: req.user,
  });
};
