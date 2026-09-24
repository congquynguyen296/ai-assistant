import mongoose from 'mongoose';
import InterviewTopic from '../models/InterviewTopic.js';

const INITIAL_TOPICS = [
  { name: 'java core', usageCount: 150 },
  { name: 'reactjs', usageCount: 125 },
  { name: 'system design', usageCount: 110 },
  { name: 'node.js', usageCount: 95 },
  { name: 'spring boot', usageCount: 80 },
  { name: 'redis caching', usageCount: 75 },
  { name: 'kubernetes', usageCount: 60 },
  { name: 'microservices', usageCount: 55 },
  { name: 'docker', usageCount: 50 },
  { name: 'javascript event loop', usageCount: 45 },
];

const seedTopics = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    console.log('Seeding initial Interview Topics...');
    
    for (const topic of INITIAL_TOPICS) {
      const existing = await InterviewTopic.findOne({ name: topic.name });
      if (!existing) {
        await InterviewTopic.create(topic);
        console.log(`+ Created topic: ${topic.name}`);
      } else {
        console.log(`- Topic already exists: ${topic.name}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedTopics();
