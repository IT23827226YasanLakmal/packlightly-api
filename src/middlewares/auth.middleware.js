const admin = require("../config/firebase.js");
const UserService = require("../services/user.service");

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Fetch user profile from Firestore to get role information
    const userProfile = await UserService.getFirestoreUserProfile(decodedToken.uid);
    
    // Merge Firebase token data with Firestore profile data
    req.user = {
      ...decodedToken,
      role: userProfile && userProfile.role ? userProfile.role : 'user', // Default to 'user' if no role set
      ...userProfile
    };
    
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = { verifyFirebaseToken };


const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

module.exports.requireRole = requireRole;

