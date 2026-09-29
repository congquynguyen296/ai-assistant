import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ai_assistant";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const Document = mongoose.connection.collection("documents");
  
  const doc = await Document.findOne();
  if (!doc) {
    console.log("No documents found");
    process.exit(0);
  }
  
  const userId = doc.userId;
  
  // Explain offset 0
  const explain0 = await Document.aggregate([
    { $match: { userId: userId } },
    { $sort: { uploadDate: -1 } },
    { $skip: 0 },
    { $limit: 10 }
  ]).explain("executionStats");
  
  console.log("EXPLAIN PAGE 1:");
  console.log(JSON.stringify(explain0, null, 2));

  // Explain offset 900
  const explain900 = await Document.aggregate([
    { $match: { userId: userId } },
    { $sort: { uploadDate: -1 } },
    { $skip: 900 },
    { $limit: 10 }
  ]).explain("executionStats");

  console.log("EXPLAIN PAGE 90:");
  console.log(JSON.stringify(explain900, null, 2));
  
  // count docs missing uploadDate
  const missingUploadDate = await Document.countDocuments({ uploadDate: { $exists: false } });
  const nullUploadDate = await Document.countDocuments({ uploadDate: null });
  
  console.log(`Docs missing uploadDate: ${missingUploadDate}`);
  console.log(`Docs with null uploadDate: ${nullUploadDate}`);
  
  process.exit(0);
}

main().catch(console.error);
