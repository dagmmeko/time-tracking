import {gql} from "apollo-server"

export const AuthType = gql`    

    enum PaymentStatus {
        PAID
        EXPIRED
    }

    enum AccountType {
        WORKER
        MANAGER
        COMPANY_REPRESENTATIVE
    }

    extend type Query {
        getAccount(id: String!): Account
    }

    extend type Mutation {
        createAccount(accountInput: AccountInput!): AccessToken!
    }
    
    type AccessToken {
        access_token: String!
        payload: String
    }

    input AccountInput {
        created_at: String!
        updated_at: String!
        deleted_at: String

        name: String!

        email: String!
        # image: 
        account_type: AccountType
        payment_plan: PlansInput
        payment_status: PaymentStatus
        reset_token: String
        reset_token_time: String
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