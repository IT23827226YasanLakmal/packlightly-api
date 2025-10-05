const UserService = require("../services/user.service");

class UserController {
  // Allowed fields for update
  static allowedFields = ["displayName", "photoURL", "phoneNumber", "role", "bio", "preferences", "disabled"];

  // Only admins can update the 'role' field
  static canUpdateField(field, req) {
    if (field === "role") {
      return req.user && req.user.role === "admin";
    }
    return true;
  }

  // Validate fields and permissions
  static validateUpdateFields(profileData, req) {
    const errors = [];
    for (const key of Object.keys(profileData)) {
      if (!UserController.allowedFields.includes(key)) {
        errors.push(`Field '${key}' is not allowed.`);
      } else if (!UserController.canUpdateField(key, req)) {
        errors.push(`You do not have permission to update '${key}'.`);
      }
    }
    return errors;
  }

  // GET /users/:uid
  static async getUser(req, res) {
    try {
      const user = await UserService.getFullUserDetails(req.params.uid);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /users
  static async listUsers(req, res) {
    try {
      const result = await UserService.listFirebaseUsers(100);
      const users = await Promise.all(
        result.users.map(async (userRecord) => {
          const profile = await UserService.getFirestoreUserProfile(userRecord.uid);
          return {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            emailVerified: userRecord.emailVerified,
            role: profile && profile.role ? profile.role : "not_assigned",
            ...profile
          };
        })
      );
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /users (create or update Firestore user profile)
  static async createUser(req, res) {
    try {
      console.log('POST /users - Request body:', JSON.stringify(req.body, null, 2));
      const { uid, email, password, ...profileData } = req.body;
      
      // If uid is provided, just create/update the Firestore profile
      if (uid) {
        console.log('Creating/updating profile for existing user:', uid);
        const updatedProfile = await UserService.setFirestoreUserProfile(uid, profileData);
        return res.status(201).json(updatedProfile);
      }
      
      // If email is provided but no uid, create a new Firebase user
      if (email) {
        if (!password) {
          console.log('Password missing for new user creation');
          return res.status(400).json({ error: "Password is required when creating a new user with email" });
        }
        
        try {
          console.log('Creating new Firebase user with email:', email);
          // Create Firebase Auth user
          const userRecord = await UserService.createFirebaseUser({ email, password, ...profileData });
          
          // Create Firestore profile
          const firestoreProfile = await UserService.setFirestoreUserProfile(userRecord.uid, {
            ...profileData,
            createdAt: new Date().toISOString()
          });
          
          return res.status(201).json({
            uid: userRecord.uid,
            email: userRecord.email,
            ...firestoreProfile
          });
        } catch (authError) {
          console.error('Firebase user creation error:', authError);
          return res.status(400).json({ error: `Failed to create user: ${authError.message}` });
        }
      }
      
      // If neither uid nor email is provided
      console.log('Neither uid nor email provided in request');
      return res.status(400).json({ 
        error: "Either 'uid' (for existing Firebase user) or 'email' and 'password' (for new user) are required" 
      });
      
    } catch (error) {
      console.error('POST /users - Unexpected error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /users/:uid (full update)
  static async updateUser(req, res) {
    try {
      const { uid } = req.params;
      const profileData = req.body;

      if (!uid) return res.status(400).json({ error: "uid is required in params" });

      const errors = UserController.validateUpdateFields(profileData, req);

      if (errors.length > 0) {
        console.error('User update validation errors:', errors);
        const forbidden = errors.some(e => e.includes("permission"));
        return res.status(forbidden ? 403 : 400).json({ errors });
      }

      const updatedProfile = await UserService.setFirestoreUserProfile(uid, profileData);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // PATCH /users/:uid (partial update)
  static async patchUser(req, res) {
    try {
      const { uid } = req.params;
      const profileData = req.body;

      if (!uid) return res.status(400).json({ error: "uid is required in params" });

      const errors = UserController.validateUpdateFields(profileData, req);

      if (errors.length > 0) {
        console.error('User patch validation errors:', errors);
        const forbidden = errors.some(e => e.includes("permission"));
        return res.status(forbidden ? 403 : 400).json({ errors });
      }

      const updatedProfile = await UserService.setFirestoreUserProfile(uid, profileData);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /users/:uid (delete user)
  static async deleteUser(req, res) {
    try {
      const { uid } = req.params;

      if (!uid) return res.status(400).json({ error: "uid is required in params" });

      // Only admins can delete users, or users can delete themselves
      if (req.user.role !== "admin" && req.user.uid !== uid) {
        return res.status(403).json({ error: "You do not have permission to delete this user" });
      }

      const result = await UserService.deleteUser(uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
