const express = require("express");

const {
  register,
  login,
  me,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const validate = require("../middleware/validationMiddleware");

const { authenticate } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/register",
  registerValidator,
  validate,
  register
);

router.post(
  "/login",
  loginValidator,
  validate,
  login
);

router.get(
  "/me",
  authenticate,
  me
);

router.get(
  "/admin-test",
  authenticate,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access confirmed",
    });
  }
);

module.exports = router;