import {gql} from "apollo-server"

export const AuthType = gql`    

    scalar Upload

    enum AccountType {
        WORKER
        MANAGER
        COMPANY_REPRESENTATIVE
    }

    extend type Query {
        getAccount(id: String!, access_token: String!): Account     
    }

    extend type Mutation {
        createAccount(accountInput: AccountInput!, image: Upload!): AccessToken!
        resetPassword(email: String): Boolean!
        login(email: String, password: String): AccessToken!
        logout(id: String!): Boolean!
    }
    
    type AccessToken {
        access_token: String!
        status: Boolean
    }

    input AccountInput {
        created_at: String!
        updated_at: String
        deleted_at: String

        name: String!

        email: String!
        account_type: AccountType!
        password: String!
        payment_plan: PlansInput
        payment_status: Boolean!
        reset_token: String
        reset_token_time: String
        access_token: String
        
      
    }
    
    type Account {
        created_at: String!
        updated_at: String!
        deleted_at: String

        name: String!

        email: String!
        # image: 
    }

    input PlansInput {
        type: String!
        description: [String!]
    }
    
    ` 