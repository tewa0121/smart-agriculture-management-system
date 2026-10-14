
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// ==================== VALIDATION HELPERS ====================

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const isValidEmail = (email) => {
  if (typeof email !== "string") return false;

  const normalizedEmail = normalizeEmail(email);

  // Require a valid-looking address ending exactly in @gmail.com
  const gmailRegex = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;

  if (!gmailRegex.test(normalizedEmail)) return false;

  const [localPart] = normalizedEmail.split("@");

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    return false;
  }

  return true;
};

const isValidPhone = (phone) => {
  if (typeof phone !== "string" && typeof phone !== "number") {
    return false;
  }

  const phoneString = String(phone).trim();

  if (!/^[0-9+\-() ]+$/.test(phoneString)) {
    return false;
  }

  const digitsOnly = phoneString.replace(/\D/g, "");
  return digitsOnly.length >= 10;
};

const isValidName = (name) =>
  typeof name === "string" &&
  name.trim().length >= 2 &&
  name.trim().length <= 100;

const isValidRole = (role) =>
  ["admin", "farmer"].includes(role);

const isValidOptionalText = (value, maxLength) =>
  value == null ||
  (typeof value === "string" && value.trim().length <= maxLength);

const normalizeIsActive = (value) => {
  if (value === true || value === 1 || value === "1") return 1;
  if (value === false || value === 0 || value === "0") return 0;
  return null;
};

const isValidPassword = (password) =>
  typeof password === "string" &&
  password.length >= 6 &&
  password.length <= 72;

const getCurrentUserId = (req) =>
  req.user?.id ?? req.user?.userId ?? req.user?.user_id;

const isDuplicateEmailError = (error) =>
  error.code === "ER_DUP_ENTRY" || error.errno === 1062;

// ==================== GET ALL USERS ====================

const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};

// ==================== GET USER BY ID ====================

const getUser = async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user.",
    });
  }
};

// ==================== CREATE USER ====================

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "farmer",
      phone,
      address,
      isActive = true,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!isValidName(name)) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email must be a valid Gmail address ending in @gmail.com.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain at least 10 digits.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 6 and 72 characters.",
      });
    }

    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be admin or farmer.",
      });
    }

    if (!isValidOptionalText(address, 255)) {
      return res.status(400).json({
        success: false,
        message: "Address must not exceed 255 characters.",
      });
    }

    const activeValue = normalizeIsActive(isActive);

    if (activeValue === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid account status.",
      });
    }

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Match the fields supported by userModel.createUser()
    const newUserId = await User.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: String(phone).trim(),
      address: address?.trim() || null,
    });

    // Apply account status if the new account should be inactive.
    // The model's createUser() method does not accept isActive.
    if (activeValue === 0) {
      await User.updateUser({
        id: newUserId,
        name: name.trim(),
        email: normalizedEmail,
        role,
        phone: String(phone).trim(),
        address: address?.trim() || null,
        isActive: 0,
      });
    }

    const createdUser = await User.getUserById(newUserId);

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: createdUser,
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (isDuplicateEmailError(error)) {
      return res.status(409).json({
        success: false,
        message: "This email address is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user.",
    });
  }
};

// ==================== UPDATE USER ====================

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = getCurrentUserId(req);

    const existingUser = await User.getUserById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const {
      name,
      email,
      role,
      phone,
      address,
      isActive,
    } = req.body;

    // Start with existing values so partial updates don't erase fields.
    const updates = {
      id: userId,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      phone: existingUser.phone,
      address: existingUser.address,
      isActive: Number(existingUser.is_active) === 0 ? 0 : 1,
    };

    if (name !== undefined) {
      if (!isValidName(name)) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 100 characters.",
        });
      }

      updates.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = normalizeEmail(email);

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Email must be a valid Gmail address ending in @gmail.com.",
        });
      }

      updates.email = normalizedEmail;
    }

    if (phone !== undefined) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must contain at least 10 digits.",
        });
      }

      updates.phone = String(phone).trim();
    }

    if (role !== undefined) {
      if (!isValidRole(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be admin or farmer.",
        });
      }

      if (
        String(userId) === String(currentUserId) &&
        role !== "admin"
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot change your own administrator role.",
        });
      }

      updates.role = role;
    }

    if (address !== undefined) {
      if (!isValidOptionalText(address, 255)) {
        return res.status(400).json({
          success: false,
          message: "Address must not exceed 255 characters.",
        });
      }

      updates.address = address?.trim() || null;
    }

    if (isActive !== undefined) {
      const activeValue = normalizeIsActive(isActive);

      if (activeValue === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid account status.",
        });
      }

      if (
        String(userId) === String(currentUserId) &&
        activeValue === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate your own account.",
        });
      }

      updates.isActive = activeValue;
    }

    const affectedRows = await User.updateUser(updates);

    // MySQL may report zero affected rows if the submitted values
    // are identical to the existing values. That's not necessarily an error.
    const updatedUser = await User.getUserById(userId);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found after update.",
      });
    }

    return res.status(200).json({
      success: true,
      message: affectedRows
        ? "User updated successfully."
        : "No user fields changed.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (isDuplicateEmailError(error)) {
      return res.status(409).json({
        success: false,
        message: "This email address is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
    });
  }
};

// ==================== UPDATE USER PASSWORD ====================

const updateUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 6 and 72 characters.",
      });
    }

    const existingUser = await User.getUserById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateUserPassword({
      id: userId,
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Update password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update password.",
    });
  }
};

// ==================== DELETE USER ====================

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = getCurrentUserId(req);

    if (String(userId) === String(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const existingUser = await User.getUserById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await User.deleteUser(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};

// ==================== EXPORT CONTROLLER FUNCTIONS ====================

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
};

