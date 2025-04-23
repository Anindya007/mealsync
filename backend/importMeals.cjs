const fs = require('fs');
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mealplanner';
const COLLECTION_NAME = 'meals';
const FILE_PATH = './global_meals_50.json';

async function importMeals() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const mealsCollection = db.collection(COLLECTION_NAME);

  // 1. Empty the collection
  await mealsCollection.deleteMany({});
  console.log('Emptied existing meals collection');

  // 2. Read and insert new meals
  const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  const result = await mealsCollection.insertMany(data);
  console.log(`Inserted ${result.insertedCount} meals`);

  await client.close();
}

importMeals().catch(console.error);

