import {gql} from "apollo-server"

export const AuthType = gql`    
    extend type Query {
        getAccount(amount: Int!): [Account]
    }
    type Account {
        name: String
    }
    ` 