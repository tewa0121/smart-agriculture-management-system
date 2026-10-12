const express = require("express");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
} = require("../controllers/userController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// All user-management endpoints require authentication
// and administrator privileges.

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getUsers
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  getUser
);

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  createUser
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  updateUser
);

router.put(
  "/:id/password",
  authenticate,
  authorizeRoles("admin"),
  updateUserPassword
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteUser
);

module.exports = router;