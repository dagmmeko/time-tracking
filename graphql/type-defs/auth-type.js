import {gql} from "apollo-server"

export const AuthType = gql`    

    scalar Upload
    scalar JSON

    extend type Query {
        getAccount(id: String!, access_token: String!): Account     
    }

    extend type Mutation {
        createAccount(accountInput: AccountInput!, image: Upload): AccessToken!
        requestRegister(email: String!): JSON!
        registerBiometric(registerBiometricInput: JSON!): AccessToken!
        resetPassword(email: String!): Boolean!
        login(email: String!, password: String!): AccessToken!
        requestLoginChallenge(email: String!): JSON
        loginBiometric(loginBiometricInput: JSON!): AccessToken!
        logout(id: String!): Boolean!
        updateAccount(id: ID!, access_token: String, ): Boolean!
        choosePaymentPlan(account_id: String!, access_token: String!, payment_plan: PlanType!): Boolean
        createStripeCheckout(account_id: String!, access_token: String!, success_url: String!, cancel_url: String!): String! 
    }
    
    type AccessToken {
        access_token: String!
        status: Boolean
    }

    input AccountInput {
        name: String!

        email: String!
        password: String!
        account_type: AccountType

      
    }
    
    type Account {
        created_at: String!
        updated_at: String
        deleted_at: String

        name: String!

        email: String!
        account_type: AccountType
        password: String!
        payment_plan: PlanType
        payment_status: Boolean!
        reset_token: String
        reset_token_time: String
        access_token: String
        stripe_subscription_id: String
    }

    enum PlanType {
        STARTER
        ENTERPRISE
        BUSINESS
    }
     
    enum AccountType {
        WORKER
        MANAGER
        COMPANY_REPRESENTATIVE
    }
    
    ` 