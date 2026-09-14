import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.dev" });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  const notifications = await mongoose.connection.collection("notifications").find().toArray();
  console.log("Notifications:", JSON.stringify(notifications, null, 2));
  process.exit(0);
};
run();
