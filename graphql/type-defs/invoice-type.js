import {gql} from "apollo-server"

export const InvoiceType = gql`
    scalar Upload

    extend type Query { 
        getInvoice(pageNumber: Int!, itemPerPage: Int!): [Invoice]
    }
    type Invoice {
        account_id: String!
        invoice_date: String!
        payment_plan_id: String!
        amount: Float!
        payment_method: String!
        payment_status: Boolean!
        invoice_documents: String
    }
   
`