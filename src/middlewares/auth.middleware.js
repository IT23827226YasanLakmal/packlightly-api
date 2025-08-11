const admin = require('../config/firebase');

async function verifyFirebaseToken(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const idToken = h.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // uid, email, custom claims, etc.
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    const claims = req.user || {};
    if (claims.role === role || (claims.admin && role === 'admin')) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = { verifyFirebaseToken, requireRole };
