import {gql} from "apollo-server"

export const AuthType = gql`    

    scalar Upload
    scalar JSON

    enum AccountType {
        WORKER
        MANAGER
        COMPANY_REPRESENTATIVE
    }

    extend type Query {
        getAccount(id: String!, access_token: String!): Account     
    }

    extend type Mutation {
        createAccount(accountInput: AccountInput!): AccessToken!
        requestRegister(email: String!): JSON!
        registerBiometric(registerBiometricInput: JSON!): AccessToken!
        resetPassword(email: String!): Boolean!
        login(email: String!, password: String!): AccessToken!
        requestLoginChallenge(email: String!): JSON
        loginBiometric(loginBiometricInput: JSON!): AccessToken!
        logout(id: String!): Boolean!
    }
    
    type AccessToken {
        access_token: String!
        status: Boolean
    }

    input AccountInput {
        name: String!

        email: String!
        password: String!
      
    }
    
    type Account {
        created_at: String!
        updated_at: String
        deleted_at: String

        name: String!

        email: String!
        account_type: AccountType
        password: String!
        payment_plan: PlansInput
        payment_status: Boolean!
        reset_token: String
        reset_token_time: String
        access_token: String
        # image: 
    }

    type PlansInput {
        type: String!
        description: [String!]
    }
    
    ` 