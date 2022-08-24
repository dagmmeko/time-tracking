import {gql} from "apollo-server"

export const AuthType = gql`    

    scalar Upload
    scalar JSON

    extend type Query {
        getAccount(accessToken: String!): AccountOutput     
    }

    extend type Mutation {
        createAccount(accountInput: AccountInput!, image: Upload): String!
        requestRegister(email: String!): JSON!
        registerBiometric(registerBiometricInput: JSON!): String!
        requestResetPassword(email: String!): Boolean!
        resetPassword(resetTokenInput: ResetInput!): Boolean!
        login(email: String!, password: String!): String!
        requestLoginChallenge(email: String!): JSON
        loginBiometric(loginBiometricInput: JSON!): String!
        logout(accessToken: String!): Boolean!
        # updateAccount(accessToken: String): Boolean!
        choosePaymentPlan(accessToken: String!, paymentPlan: PlanType!): Boolean
        createStripeCheckout(accessToken: String!, successUrl: String!, cancelUrl: String!): String! 
    }
    
    input AccountInput {
        name: String!
        email: String!
        password: String!
        account_type: AccountType     
    }
    
    type AccountOutput {
        created_at: String!
        updated_at: String
        deleted_at: String

        name: String!

        email: String!
        account_type: AccountType
        payment_plan: PlanType
        payment_status: Boolean!
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

    input  ResetInput {
        resetToken: String!
        password: String!
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