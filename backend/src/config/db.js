import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME,
    });
    console.log(`Kết nối database thành công: ${conn.connection.name} trên ${conn .connection.host}`);

  } catch (error) {
    console.error(`Lỗi kết nối database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
