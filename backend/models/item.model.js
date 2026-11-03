import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    itemType: { type: String, enum: ["lost", "found"], required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["open", "claimed", "returned"],
      default: "open"
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

itemSchema.index({ itemType: 1, status: 1, category: 1, createdAt: -1 });

const Item = mongoose.model("Item", itemSchema);
export default Item;
