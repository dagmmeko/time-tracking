import {gql} from "apollo-server"

export default gql`
    type Account {
        name: String
    }

    type Query {
        getAccount(amount: Int!): [Account]
    }
    ` 
