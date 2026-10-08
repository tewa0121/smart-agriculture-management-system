const bcrypt = require("bcryptjs");

const userModel = require("../models/userModel");
const { generateToken } = require("../utils/jwt");

const sanitizeUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone = null,
      address = null,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await userModel.findByEmail(
      normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    /*
      Public registration always creates a farmer.

      Admin accounts must not be created by simply sending:
      { role: "admin" }
      from the frontend.
    */
    const userId = await userModel.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "farmer",
      phone,
      address,
    });

    const user = await userModel.findById(userId);

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await userModel.findByEmail(
      normalizedEmail
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};

module.exports = {
  register,
  login,
  me,
};