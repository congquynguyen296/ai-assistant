import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["success", "info", "warning", "error"], default: "info" },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
