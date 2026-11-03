import express from "express";
import upload from "../middleware/upload.middleware.js";
import { body, param, query } from "express-validator";
import {
  createItem, getAllItems, getSingleItem, updateItem, deleteItem
} from "../controllers/item.controller.js";
import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = express.Router();

router.get(
  "/",
  [
    query("type").optional().isIn(["lost", "found"]),
    query("status").optional().isIn(["open", "claimed", "returned"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 })
  ],
  validate,
  getAllItems
);

router.get("/:id", [param("id").isMongoId()], validate, getSingleItem);

router.post(
  "/",
  protect,
  upload.single("image"),
  [
    body("title").trim().notEmpty().isLength({ max: 120 }),
    body("description").trim().notEmpty().isLength({ max: 2000 }),
    body("category").trim().notEmpty().isLength({ max: 60 }),
    body("location").trim().notEmpty().isLength({ max: 120 }),
    body("itemType").isIn(["lost", "found"]),
    body("date").isISO8601().toDate()
  ],
  validate,
  createItem
);
router.put(
  "/:id",
  protect,
  [param("id").isMongoId()],
  validate,
  updateItem
);

router.delete("/:id", protect, [param("id").isMongoId()], validate, deleteItem);

export default router;
