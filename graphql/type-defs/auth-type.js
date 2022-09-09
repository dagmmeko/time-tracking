import {gql} from "apollo-server"

export const AuthType = gql`    

    scalar Upload
    scalar JSON

    extend type Query {
        getAccount: AccountOutput
        getAccountWithId(accountId: String): AccountOutput
        getPaymentPlans: [PaymentPlan] 
        getPaymentPlanById(planId: String!): PaymentPlan
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
        logout: Boolean!
        choosePaymentPlan( paymentPlanId: String!): Boolean
        createStripeCheckout(successUrl: String!, cancelUrl: String!): String! 
        createPaymentPlan(paymentPlanInput: PaymentPlanInput!): String!
    }
    
    type AccountOutput {
        created_at: String!
        updated_at: String
        deleted_at: String

        name: String!

        email: String!
        account_type: AccountType
        payment_plan_id: String
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
        payment_plan_id: String
        payment_status: Boolean!
        reset_token: String
        reset_token_time: String
        access_token: String
        stripe_subscription_id: String
    }

    type PaymentPlan {
        created_at: String
        updated_at: String
        deleted_at: String

        plan_name: String
        plan_description: String
        plan_price_id: String
        plan_price_amount: Float
        plan_price_currency: String
    }

    input AccountInput {
        name: String!
        email: String!
        password: String!
        account_type: AccountType     
    }

    input  ResetInput {
        resetToken: String!
        password: String!
    }

    input PaymentPlanInput {
        plan_name: String!
        plan_description: String!
        plan_price_id: String!
        plan_price_amount: Float
        plan_price_currency: String
    }
     
    enum AccountType {
        WORKER
        MANAGER
        COMPANY_REPRESENTATIVE
    }
    
    ` 