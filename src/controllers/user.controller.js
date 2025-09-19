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
      const { uid, ...profileData } = req.body;
      if (!uid) return res.status(400).json({ error: "uid is required" });

      const updatedProfile = await UserService.setFirestoreUserProfile(uid, profileData);
      res.status(201).json(updatedProfile);
    } catch (error) {
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
}

module.exports = UserController;
