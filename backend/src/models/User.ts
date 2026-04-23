import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import type { UserDocument } from "@/types/entity.js";

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: [true, "Tên đăng nhập không được để trống"],
      unique: true,
      trim: true,
      minlength: [3, "Tên đăng nhập phải có ít nhất 3 ký tự"],
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: function (this: UserDocument) {
        return !this.googleId;
      },
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password || "", salt);
});

userSchema.methods.matchPassword = async function (
  this: UserDocument,
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password || "");
};

const User = model<UserDocument>("User", userSchema);
export default User;
