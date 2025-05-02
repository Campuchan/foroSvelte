import { MongoClient } from 'mongodb';

export const client = new MongoClient("mongodb://localhost:27017")

async function initDB() {

  client.connect()
  const db = client.db("foro");

  const colecciones = ['users', 'posts', 'comentarios', 'sessions', 'chat'];

  // Get the list of existing collection names
  const coleccionesEnServidor = await db.listCollections().toArray();
  const coleccionesEnServidorNombres = coleccionesEnServidor.map(c => c.name);

  for (const coleccion of colecciones) {
    if (!coleccionesEnServidorNombres.includes(coleccion)) {
      console.log(`Creating colección '${coleccion}'...`);
      await db.createCollection(coleccion);
    } else {
      console.log(`Colección '${coleccion}' ya existe existe.`);
    }
  }
  await db.collection('users').createIndex({ username: 1 }, { unique: true });

  await client.close();
  console.log('Inicialización de la base de datos completada.');
}

initDB()
    .then(() => 
        process.exit(0))
    .catch((err) => {
        console.error('ErrorInicial:', err);
        process.exit(1);
    });