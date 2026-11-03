import express from "express";
import { body, param } from "express-validator";
import {
  createClaim, getItemClaims, updateClaimStatus
} from "../controllers/claim.controller.js";
import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("itemId").isMongoId(),
    body("message").trim().notEmpty().isLength({ max: 1000 })
  ],
  validate,
  createClaim
);

router.get(
  "/item/:itemId",
  protect,
  [param("itemId").isMongoId()],
  validate,
  getItemClaims
);

router.patch(
  "/:id",
  protect,
  [param("id").isMongoId(), body("status").isIn(["approved", "rejected"])],
  validate,
  updateClaimStatus
);

export default router;
