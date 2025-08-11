const User = require('../models/User');

async function upsertFromFirebase(userObj) {
  const filter = { uid: userObj.uid };
  const update = {
    email: userObj.email,
    displayName: userObj.name || userObj.displayName,
    photoURL: userObj.picture || userObj.photoURL,
    uid: userObj.uid
  };
  return User.findOneAndUpdate(filter, update, { upsert: true, new: true });
}

async function getByUid(uid) {
  return User.findOne({ uid });
}

module.exports = { upsertFromFirebase, getByUid };
