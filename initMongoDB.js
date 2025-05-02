import { start_mongo, client } from './src/db/mongo';

async function initDB() {
  await start_mongo();
  const db = client.db();

  // List of collections you want to ensure exist
  const collectionsToCreate = ['users', 'posts', 'comentarios', 'sessions', 'chat'];

  // Get the list of existing collection names
  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map(c => c.name);

  for (const coll of collectionsToCreate) {
    if (!existingNames.includes(coll)) {
      console.log(`Creating collection '${coll}'...`);
      await db.createCollection(coll);
    } else {
      console.log(`Collection '${coll}' already exists.`);
    }
  }

  await client.close();
  console.log('Database initialization complete.');
}

initDB().then(() => process.exit(0)).catch((err) => {
  console.error('Error initializing database:', err);
  process.exit(1);
});