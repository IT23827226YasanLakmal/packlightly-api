const { getByUid } = require('../services/user.service');

async function getProfile(req, res, next) {
  try {
    const user = await getByUid(req.user.uid);
    res.json(user);
  } catch (e) { next(e); }
}

module.exports = { getProfile };
