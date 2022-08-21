import { gql } from "apollo-server";

export const ReportType = gql`
    extend type Query {
        getExpenseReports(accountId: String!, accessToken: String!): [ExpenseReport]
        getIncidentReports(accountId: String!, accessToken: String!): [IncidentReport]
    }
    extend type Mutation {
        createExpenseReport(reportInput: createExpenseReportInput!, accountId: String!, accessToken: String!): String!
        updateExpenseReport(reportInput: updateExpenseReportInput!, accountId: String!, accessToken: String!): String!
        removeExpenseReport(reportId: String!, accountId: String!, accessToken: String!): String!
        createIncidentReport(reportInput: createIncidentReportInput!, accountId: String!, accessToken: String!): String!
        updateIncidentReport(reportInput: updateIncidentReportInput!, accountId: String!, accessToken: String!):String!
        removeIncidentReport(reportId: String!, accountId: String!, accessToken: String!): String!
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

    input createExpenseReportInput {
        report_description: String!
        amount: Float!
        task_id: String!
        expense_reason: String!
        note: String!,
        expense_date: String!
    }

    input updateExpenseReportInput{
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

    input createIncidentReportInput{
        task_id: String!
        incident_date: String!,
        mistake_description: String!,
        mistake_reason: String!,
        solution: String!,
        prevention: String!,
        note: String!,
    }

    input updateIncidentReportInput{
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