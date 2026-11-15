import mongoose from "mongoose";
import Claim from "../models/claim.model.js";
import Item from "../models/item.model.js";

export const createClaim = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({ message: "A valid itemId is required" });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.status !== "open") {
      return res.status(400).json({ message: "This item is no longer open for responses" });
    }

    if (item.postedBy.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot submit a report on your own item" });
    }

    const claim = await Claim.create({
      item: itemId,
      claimedBy: req.user._id,
      message
    });

    const populatedClaim = await Claim.findById(claim._id).populate("claimedBy", "name email");

    return res.status(201).json({ message: "Report submitted successfully", claim: populatedClaim });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already submitted a response for this item" });
    }
    return res.status(400).json({ message: "Could not submit report", error: error.message });
  }
};

export const getItemClaims = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(req.params.itemId).populate("postedBy", "name email");
    if (!item) return res.status(404).json({ message: "Item not found" });

    const postedById = item.postedBy?._id || item.postedBy;
    const isOwner = postedById.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (isOwner || isAdmin) {
      const claims = await Claim.find({ item: item._id })
        .populate("claimedBy", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({ count: claims.length, claims, isOwner: true });
    }

    // Respondent / Visitor view
    const claims = await Claim.find({ item: item._id, claimedBy: req.user._id })
      .populate("claimedBy", "name email")
      .sort({ createdAt: -1 });

    const hasApproved = claims.some(c => c.status === "approved");

    return res.status(200).json({
      count: claims.length,
      claims,
      isOwner: false,
      ownerContact: hasApproved && item.postedBy ? {
        name: item.postedBy.name,
        email: item.postedBy.email
      } : null
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch claims" });
  }
};

export const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid claim ID" });
    }

    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const item = claim.item;
    const isOwner = item.postedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this claim" });
    }

    if (claim.status !== "pending") {
      return res.status(409).json({ message: "This report has already been processed" });
    }

    claim.status = status;
    await claim.save();

    if (status === "approved") {
      item.status = "returned";
      await item.save();

      await Claim.updateMany(
        { item: item._id, _id: { $ne: claim._id }, status: "pending" },
        { $set: { status: "rejected" } }
      );
    }

    const populatedClaim = await Claim.findById(claim._id).populate("claimedBy", "name email");

    return res.status(200).json({
      message: `Report ${status} successfully`,
      claim: populatedClaim,
      itemStatus: item.status
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not update claim status" });
  }
};
