import db from "../../index.js"

import { ObjectId } from "mongodb";

import {AuthenticationError} from "apollo-server"

export const ReportResolver = {
    Query: {
        getExpenseReports: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })
            if (user && user.access_token === args.accessToken){
                const reports = db.collection('reports');
                const reportData = await reports.find({created_by: new ObjectId(args.accountId)}).toArray();
                return reportData
            }
            throw new AuthenticationError("You are not authorized to get reports")
        },
        getIncidentReports: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })
            if (user && user.access_token === args.accessToken){
                const reports = db.collection('reports');
                const reportData = await reports.find({created_by: new ObjectId(args.accountId)}).toArray();
                return reportData
            }
            throw new AuthenticationError("You are not authorized to get reports")
        }
    },
    Mutation: {
        createExpenseReport: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const reports = db.collection('expense_reports');
                const reportData = await reports.insertOne({
                    created_at: new Date(),
                    updated_at: null,
                    deleted_at: null,

                    report_description: args.reportInput.report_description,
                    amount: args.reportInput.amount,
                    task_id: args.reportInput.task_id,
                    expense_reason: args.reportInput.expense_reason,
                    note: args.reportInput.note,
                    expense_date: args.reportInput.expense_date,
                    created_by: new ObjectId(args.accountId)
                });
                console.log(reportData)
                return reportData.insertedId
            }
            throw new AuthenticationError("You are not authorized to create a report")
        },
        updateExpenseReport: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const reports = db.collection('expense_reports');
                const reportData = await reports.findOne({_id: new ObjectId(args.reportInput.report_id)});

                if (reportData.created_by.toString() === args.accountId){
                    const reportUpdateResult = await reports.updateOne({_id: new ObjectId(args.reportInput.report_id)}, {$set: {
                        updated_at: new Date(),
                        report_description: args.reportInput.report_description || reportData.report_description,
                        amount: args.reportInput.amount || reportData.amount,
                        task_id: args.reportInput.task_id || reportData.task_id,
                        expense_reason: args.reportInput.expense_reason || reportData.expense_reason,
                        note: args.reportInput.note || reportData.note,
                        expense_date: args.reportInput.expense_date || reportData.expense_date
                    }});
                    return reportUpdateResult.modifiedCount
                }
                throw new AuthenticationError("You are not authorized to update this report")
            }
            throw new AuthenticationError("You are not authorized to update this report")
        }, 
        removeExpenseReport: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const reports = db.collection('expense_reports');
                const reportData = await reports.findOne({_id: new ObjectId(args.reportId)});

                if (reportData.created_by.toString() === args.accountId){
                    const reportRemoveResult = await reports.deleteOne({_id: new ObjectId(args.reportId)});
                    return reportRemoveResult.deletedCount
                }
                throw new AuthenticationError("You are not authorized to remove this report")
            }
            throw new AuthenticationError("You are not authorized to remove this report")
        },
        createIncidentReport: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const reports = db.collection('incident_reports');
                const reportData = await reports.insertOne({
                    created_at: new Date(),
                    updated_at: null,
                    deleted_at: null,

                    task_id: args.reportInput.task_id,
                    incident_date: args.reportInput.incident_date,
                    mistake_description: args.reportInput.mistake_description,
                    mistake_reason: args.reportInput.mistake_reason,
                    solution: args.reportInput.solution,
                    prevention:  args.reportInput.prevention,
                    note: args.reportInput.note,
                    created_by: new ObjectId(args.accountId)
                });
                return reportData.insertedId
            }
            throw new AuthenticationError("You are not authorized to create a report")
        },
        updateIncidentReport: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const reports = db.collection('incident_reports');
                const reportData = await reports.findOne({_id: new ObjectId(args.reportInput.report_id)});
                
                if (reportData.created_by.toString() === args.accountId){
                    const reportUpdateResult = await reports.updateOne({_id: new ObjectId(args.reportInput.report_id)}, {$set: {
                        updated_at: new Date(),
                        task_id: args.reportInput.task_id || reportData.task_id,
                        incident_date: args.reportInput.incident_date || reportData.incident_date,
                        mistake_description: args.reportInput.mistake_description || reportData.mistake_description,
                        mistake_reason: args.reportInput.mistake_reason || reportData.mistake_reason,
                        solution: args.reportInput.solution || reportData.solution,
                        prevention:  args.reportInput.prevention || reportData.prevention,
                        note: args.reportInput.note || reportData.note
                    }});
                    return reportUpdateResult.modifiedCount
                }
                throw new AuthenticationError("You are not authorized to update this report")
            }
            throw new AuthenticationError("You are not authorized to update this report")
        },
        removeIncidentReport: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const reports = db.collection('incident_reports');
                const reportData = await reports.findOne({_id: new ObjectId(args.reportId)});

                if (reportData.created_by.toString() === args.accountId){
                    const reportRemoveResult = await reports.deleteOne({_id: new ObjectId(args.reportId)});
                    return reportRemoveResult.deletedCount
                }
                throw new AuthenticationError("You are not authorized to remove this report")
            }
            throw new AuthenticationError("You are not authorized to remove this report")
        }
    }
}

