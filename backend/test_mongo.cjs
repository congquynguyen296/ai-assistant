const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/hyra-platform";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    const doc = await db.collection('documents').findOne({});
    if (!doc) return;
    
    const explain1 = await db.command({
      explain: {
        aggregate: "documents",
        pipeline: [
          { $match: { userId: doc.userId } },
          { $sort: { uploadDate: -1 } },
          { $skip: 0 },
          { $limit: 10 }
        ],
        cursor: {}
      },
      verbosity: "executionStats"
    });
    
    console.log(JSON.stringify(explain1.stages[0].$cursor, null, 2));

    const explain90 = await db.command({
      explain: {
        aggregate: "documents",
        pipeline: [
          { $match: { userId: doc.userId } },
          { $sort: { uploadDate: -1 } },
          { $skip: 900 },
          { $limit: 10 }
        ],
        cursor: {}
      },
      verbosity: "executionStats"
    });
    console.log("DocsExamined skip 900:", explain90.stages[0].$cursor.executionStats.docsExamined);
    console.log("KeysExamined skip 900:", explain90.stages[0].$cursor.executionStats.totalKeysExamined);
  } catch(e) { console.error(e) } finally { client.close() }
}
run();
