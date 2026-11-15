import mongoose from "mongoose";
import Item from "../models/item.model.js";
import Claim from "../models/claim.model.js";

export const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      itemType,
      date
    } = req.body;

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : "";

    const item = await Item.create({
      title,
      description,
      category,
      location,
      itemType,
      date,
      imageUrl,
      postedBy: req.user._id
    });

    return res.status(201).json({
      message: "Item posted successfully",
      item
    });

  } catch (error) {
    return res.status(400).json({
      message: "Could not create item",
      error: error.message
    });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const { search, type, category, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (type) filter.itemType = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 10));

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate("postedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Item.countDocuments(filter)
    ]);

    return res.status(200).json({
      count: items.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      items
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch items" });
  }
};

export const getSingleItem = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid item ID" });
  }

  const item = await Item.findById(req.params.id).populate("postedBy", "name email");
  if (!item) return res.status(404).json({ message: "Item not found" });
  return res.status(200).json({ item });
};

export const updateItem = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isOwner = item.postedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You cannot update this item" });
    }

    const allowedFields = ["title", "description", "category", "location", "date", "imageUrl"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    }

    await item.save();
    return res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    return res.status(400).json({ message: "Could not update item", error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isOwner = item.postedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You cannot delete this item" });
    }

    await Claim.deleteMany({ item: item._id });
    await item.deleteOne();
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete item" });
  }
};
