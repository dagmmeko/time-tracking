import { gql } from "apollo-server";

export const ReportType = gql`
    extend type Query {
        getExpenseReports(accessToken: String!): [ExpenseReport]
        getIncidentReports(accessToken: String!): [IncidentReport]
    }
    extend type Mutation {
        createExpenseReport(reportInput: CreateExpenseReportInput!, accessToken: String!): String!
        updateExpenseReport(reportInput: UpdateExpenseReportInput!, accessToken: String!): String!
        removeExpenseReport(reportId: String!, accessToken: String!): String!
        createIncidentReport(reportInput: CreateIncidentReportInput!, accessToken: String!): String!
        updateIncidentReport(reportInput: UpdateIncidentReportInput!, accessToken: String!):String!
        removeIncidentReport(reportId: String!, accessToken: String!): String!
    }

    type ExpenseReport {
        created_at: String!
        updated_at: String
        deleted_at: String

        report_description: String!
        amount: Float!
        task_id: String!
        expense_reason: String!
        note: String!
        expense_date: String!
        # files: 

        created_by: String!
    }

    input CreateExpenseReportInput {
        report_description: String!
        amount: Float!
        task_id: String!
        expense_reason: String!
        note: String!,
        expense_date: String!
    }

    input UpdateExpenseReportInput{
        report_id: String!
        report_description: String
        amount: Float
        task_id: String
        expense_reason: String
        note: String
        expense_date: String
    }

    type IncidentReport{
        created_at: String!
        updated_at: String
        deleted_at: String

        task_id: String!
        incident_date: String!,
        mistake_description: String!,
        mistake_reason: String!,
        solution: String!,
        prevention: String!,
        note: String!,

        created_by: String!
    }

    input CreateIncidentReportInput{
        task_id: String!
        incident_date: String!,
        mistake_description: String!,
        mistake_reason: String!,
        solution: String!,
        prevention: String!,
        note: String!,
    }

    input UpdateIncidentReportInput{
        report_id: String!
        task_id: String
        incident_date: String,
        mistake_description: String,
        mistake_reason: String,
        solution: String,
        prevention: String,
        note: String,
    }
`