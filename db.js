import { MongoClient } from 'mongodb'
import { ApolloServer } from 'apollo-server';
import typeDefs from "./graphql/typeDefs.js"
import resolvers from "./graphql/resolvers.js"

const url = 'mongodb://localhost:27017';

const client = new MongoClient(url, { useUnifiedTopology: true } );
const server = new ApolloServer({typeDefs, resolvers })

await client.connect().then(()=> {
    console.log('Connected successfully to server');
    return server.listen({port: 8000})
});

export default client