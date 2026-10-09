const expenseModel = require("../models/expenseModel");
const farmModel = require("../models/farmModel");
const fieldModel = require("../models/fieldModel");
const cropModel = require("../models/cropModel");


// Allowed expense categories
const allowedCategories = [
  "fertilizer",
  "irrigation",
  "labor",
  "pesticide",
  "seeds",
  "equipment",
  "transport",
  "other",
];


// Get all expenses
const getExpenses = async (req, res) => {
  try {
    const expenses =
      await expenseModel.getExpensesByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error(
      "Get expenses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve expenses",
    });
  }
};


// Get one expense
const getExpense = async (req, res) => {
  try {
    const expenseId = Number(req.params.id);

    if (
      !Number.isInteger(expenseId) ||
      expenseId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
    }

    const expense =
      await expenseModel.getExpenseById(
        expenseId,
        req.user.id
      );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error(
      "Get expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve expense",
    });
  }
};


// Create expense
const createExpense = async (req, res) => {
  try {
    const {
      farmId,
      fieldId = null,
      cropId = null,
      category,
      description = null,
      amount,
      expenseDate,
    } = req.body;


    // Required fields
    if (
      !farmId ||
      !category ||
      amount === undefined ||
      amount === null ||
      !expenseDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Farm, category, amount, and expense date are required",
      });
    }


    // Validate category
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense category",
      });
    }


    // Validate amount
    if (
      Number.isNaN(Number(amount)) ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be a valid non-negative number",
      });
    }


    // Validate farm ownership
    const farm =
      await farmModel.getFarmById(
        Number(farmId),
        req.user.id
      );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }


    // Validate field ownership
    if (fieldId) {
      const field =
        await fieldModel.getFieldById(
          Number(fieldId),
          req.user.id
        );

      if (!field) {
        return res.status(404).json({
          success: false,
          message: "Field not found",
        });
      }

      if (
        Number(field.farm_id) !==
        Number(farmId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Field does not belong to the selected farm",
        });
      }
    }


    // Validate crop ownership
    if (cropId) {
      const crop =
        await cropModel.getCropById(
          Number(cropId),
          req.user.id
        );

      if (!crop) {
        return res.status(404).json({
          success: false,
          message: "Crop not found",
        });
      }

      if (
        fieldId &&
        Number(crop.field_id) !==
          Number(fieldId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Crop does not belong to the selected field",
        });
      }

      if (
        !fieldId &&
        Number(crop.farm_id) !==
          Number(farmId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Crop does not belong to the selected farm",
        });
      }
    }


    const expenseId =
      await expenseModel.createExpense({
        farmId: Number(farmId),

        fieldId: fieldId
          ? Number(fieldId)
          : null,

        cropId: cropId
          ? Number(cropId)
          : null,

        category,

        description,

        amount: Number(amount),

        expenseDate,
      });


    const expense =
      await expenseModel.getExpenseById(
        expenseId,
        req.user.id
      );


    return res.status(201).json({
      success: true,
      message:
        "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    console.error(
      "Create expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create expense",
    });
  }
};


// Update expense
const updateExpense = async (req, res) => {
  try {
    const expenseId = Number(req.params.id);

    if (
      !Number.isInteger(expenseId) ||
      expenseId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
    }


    // Confirm ownership
    const existingExpense =
      await expenseModel.getExpenseById(
        expenseId,
        req.user.id
      );

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }


    const {
      farmId,
      fieldId = null,
      cropId = null,
      category,
      description = null,
      amount,
      expenseDate,
    } = req.body;


    if (
      !farmId ||
      !category ||
      amount === undefined ||
      amount === null ||
      !expenseDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Farm, category, amount, and expense date are required",
      });
    }


    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense category",
      });
    }


    if (
      Number.isNaN(Number(amount)) ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be a valid non-negative number",
      });
    }


    // Validate farm ownership
    const farm =
      await farmModel.getFarmById(
        Number(farmId),
        req.user.id
      );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }


    // Validate field ownership
    if (fieldId) {
      const field =
        await fieldModel.getFieldById(
          Number(fieldId),
          req.user.id
        );

      if (!field) {
        return res.status(404).json({
          success: false,
          message: "Field not found",
        });
      }

      if (
        Number(field.farm_id) !==
        Number(farmId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Field does not belong to the selected farm",
        });
      }
    }


    // Validate crop ownership
    if (cropId) {
      const crop =
        await cropModel.getCropById(
          Number(cropId),
          req.user.id
        );

      if (!crop) {
        return res.status(404).json({
          success: false,
          message: "Crop not found",
        });
      }

      if (
        fieldId &&
        Number(crop.field_id) !==
          Number(fieldId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Crop does not belong to the selected field",
        });
      }

      if (
        !fieldId &&
        Number(crop.farm_id) !==
          Number(farmId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Crop does not belong to the selected farm",
        });
      }
    }


    const affectedRows =
      await expenseModel.updateExpense({
        expenseId,
        userId: req.user.id,

        farmId: Number(farmId),

        fieldId: fieldId
          ? Number(fieldId)
          : null,

        cropId: cropId
          ? Number(cropId)
          : null,

        category,

        description,

        amount: Number(amount),

        expenseDate,
      });


    if (affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were made",
      });
    }


    const updatedExpense =
      await expenseModel.getExpenseById(
        expenseId,
        req.user.id
      );


    return res.status(200).json({
      success: true,
      message:
        "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    console.error(
      "Update expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update expense",
    });
  }
};


// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expenseId = Number(req.params.id);

    if (
      !Number.isInteger(expenseId) ||
      expenseId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
    }


    const existingExpense =
      await expenseModel.getExpenseById(
        expenseId,
        req.user.id
      );

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }


    await expenseModel.deleteExpense(
      expenseId,
      req.user.id
    );


    return res.status(200).json({
      success: true,
      message:
        "Expense deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete expense",
    });
  }
};


module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};