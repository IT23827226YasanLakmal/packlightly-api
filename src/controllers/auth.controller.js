const admin = require('../config/firebase');
const { upsertFromFirebase, getByUid } = require('../services/user.service');

async function profile(req, res, next) {
  try {
    const decoded = req.user;
    const user = await upsertFromFirebase({ uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture });
    res.json({ user, tokenInfo: decoded });
  } catch (err) { next(err); }
}

module.exports = { profile };
