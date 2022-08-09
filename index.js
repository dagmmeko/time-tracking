import { MongoClient } from 'mongodb'
import { ApolloServer } from 'apollo-server';
import typeDefs from "./graphql/typeDefs.js"
import resolvers from "./graphql/resolvers.js"

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'timeTracker';



const server = new ApolloServer({typeDefs, resolvers })

async function main() {
  // Use connect method to connect to the server
  await client.connect().then(()=> {
    console.log('Connected successfully to server');
    return server.listen({port: 8000})
  });
  const db = client.db(dbName);
  const collection = db.collection('documents');
  const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
console.log('Inserted documents =>', insertResult);
  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());