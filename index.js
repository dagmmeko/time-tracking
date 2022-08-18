import dotenv from "dotenv"
dotenv.config()

import { MongoClient } from 'mongodb'
import { ApolloServer } from 'apollo-server';
import {GlobalType} from "./graphql/type-defs/_global-type.js"
import {GlobalResolver} from "./graphql/resolvers/_global-resolver.js"
import {AuthResolver} from './graphql/resolvers/auth-resolver.js';
import {AuthType} from './graphql/type-defs/auth-type.js';
import {InvoiceType} from './graphql/type-defs/invoice-type.js';
import {InvoiceResolver} from './graphql/resolvers/invoice-resolver.js';
import {TaskType} from './graphql/type-defs/task-type.js';
import {TaskResolver} from './graphql/resolvers/task-resolver.js';
import "./utils/stripe-webhook.js"


const url = 'mongodb://localhost:27017';

const client = new MongoClient(url, { useUnifiedTopology: true } );
const server = new ApolloServer({typeDefs: [GlobalType ,AuthType, InvoiceType, TaskType ], resolvers: [GlobalResolver ,AuthResolver,InvoiceResolver, TaskResolver] })
const db = client.db("time-tracker")

await client.connect().then(()=> {
    console.log('Connected successfully to server');
    return server.listen({port: 8000})
});

export default db
