import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env.dev' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
  
  // Find the document
  const doc = await mongoose.connection.collection("documents").findOne({ _id: new mongoose.Types.ObjectId("6aa75e3cf0866989b504d7cc") });
  console.log("Document userId:", doc?.userId);
  
  // Find notifications
  const notifs = await mongoose.connection.collection("notifications").find().toArray();
  console.log("All notifications:", notifs);
  
  process.exit(0);
}
run();
