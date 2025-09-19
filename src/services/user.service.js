const admin = require("../config/firebase");
const db = admin.firestore();

class UserService {
  // Get Firebase user by UID
  static async getFirebaseUser(uid) {
    return await admin.auth().getUser(uid);
  }

  // List Firebase users (max 1000 at once)
  static async listFirebaseUsers(limit = 1000, pageToken) {
    return await admin.auth().listUsers(limit, pageToken);
  }

  // Get user profile from Firestore by UID
  static async getFirestoreUserProfile(uid) {
    const userDoc = await db.collection('users').doc(uid).get();
    return userDoc.exists ? userDoc.data() : null;
  }

  // Create or update user profile in Firestore
  static async setFirestoreUserProfile(uid, profileData) {
    await db.collection('users').doc(uid).set(profileData, { merge: true });
    return await this.getFirestoreUserProfile(uid);
  }

  // Merge Firebase Auth & Firestore profile
  static async getFullUserDetails(uid) {
    const firebaseUser = await this.getFirebaseUser(uid);
    const profile = await this.getFirestoreUserProfile(uid);
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
      role: profile && profile.role ? profile.role : "not_assigned",
      createdAt: profile && profile.createdAt ? profile.createdAt : firebaseUser.metadata.creationTime,
      ...profile // spread any additional profile fields
    };
  }
}

module.exports = UserService;
