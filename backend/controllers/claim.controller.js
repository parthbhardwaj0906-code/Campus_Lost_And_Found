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

    if (item.itemType !== "found" || item.status !== "open") {
      return res.status(400).json({ message: "This item cannot be claimed" });
    }

    if (item.postedBy.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot claim your own item" });
    }

    const claim = await Claim.create({
      item: itemId,
      claimedBy: req.user._id,
      message
    });

    return res.status(201).json({ message: "Claim request submitted", claim });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already claimed this item" });
    }
    return res.status(400).json({ message: "Could not submit claim", error: error.message });
  }
};

export const getItemClaims = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isOwner = item.postedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view these claims" });
    }

    const claims = await Claim.find({ item: item._id })
      .populate("claimedBy", "name email")
      .populate("item", "title location")
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: claims.length, claims });
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

    if (claim.status !== "pending" || item.status !== "open") {
      return res.status(409).json({ message: "This claim or item has already been processed" });
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

    return res.status(200).json({ message: `Claim ${status}`, claim });
  } catch (error) {
    return res.status(500).json({ message: "Could not update claim status" });
  }
};
