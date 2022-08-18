import {gql} from "apollo-server"

export const InvoiceType = gql`
    extend type Query { 
        getInvoice(accountId: String!, accessToken: String!): [Invoice]
    }
    type Invoice {
        account_id: String!
        invoice_date: String!
        payment_plan: PlanType!
        amount: Float!
        payment_method: String!
        payment_status: Boolean!
        invoice_documents: String
    }
    enum PlanType {
        STARTER
        ENTERPRISE
        BUSINESS
    }   
`