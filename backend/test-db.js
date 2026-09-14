import { MongoClient } from 'mongodb';

async function run() {
  const client = new MongoClient("mongodb+srv://congquy296:congquy2962002@cluster0.o54a2z9.mongodb.net/AI-Assistant-Dev?retryWrites=true&w=majority");
  await client.connect();
  const db = client.db();
  const notifs = await db.collection("notifications").find().sort({createdAt:-1}).limit(2).toArray();
  console.log("Notifs:", JSON.stringify(notifs, null, 2));
  await client.close();
}
run();
