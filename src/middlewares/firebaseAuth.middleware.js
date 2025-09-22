const admin = require("../config/firebase");
const UserService = require("../services/user.service");

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
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
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = verifyFirebaseToken;
