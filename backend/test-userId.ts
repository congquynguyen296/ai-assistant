import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to DB");
  
  // Find notifications
  const notifs = await mongoose.connection.collection("notifications").find().sort({createdAt:-1}).limit(2).toArray();
  console.log("All notifications:", JSON.stringify(notifs, null, 2));
  
  process.exit(0);
}
run();
