import {gql} from "apollo-server"

export const AuthType = gql`
    enum Payment_Methods{
        CREDIT_CARD
        PAYPAL
        INTERNET_BANKING
    }

    extends type Query{

    } 
    extend type Mutation {

    }
    
    type Payment {
        created_at: String!
        updated_at: String!
        deleted_at: String

        method: Payment_Methods

    }

    type Checkout {
        created_at: String!
        updated_at: String!
        deleted_at: String

        plans_id: String!
        account_id: String!
        

    }

`