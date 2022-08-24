import db from "../../index.js"

import { ObjectId } from "mongodb";

import {AuthenticationError, UserInputError} from "apollo-server"
import jwt from "jsonwebtoken"


export const ReportResolver = {
    Query: {
        getExpenseReports: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)
            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
                if (user && user.access_token === args.accessToken){
                    const reports = db.collection('reports');
                    const reportData = await reports.find({created_by: new ObjectId(decode.sub)}).toArray();
                    return reportData
                }
                throw new AuthenticationError("You are not authorized to get reports")
            }
            throw new UserInputError("Access token invalid.")
        },
        getIncidentReports: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode) {
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
                if (user && user.access_token === args.accessToken){
                    const reports = db.collection('reports');
                    const reportData = await reports.find({created_by: new ObjectId(decode.sub)}).toArray();
                    return reportData
                }
                throw new AuthenticationError("You are not authorized to get reports")
            }
            throw new UserInputError("Access token invalid.")
        }
    },
    Mutation: {
        createExpenseReport: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)
            
            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
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
                        created_by: new ObjectId(decode.sub)
                    });
                    console.log(reportData)
                    return reportData.insertedId
                }
                throw new AuthenticationError("You are not authorized to create a report")    
            }
            throw new UserInputError("Access token invalid.")
        },
        updateExpenseReport: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)
            
            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken){
                    const reports = db.collection('expense_reports');
                    const reportData = await reports.findOne({_id: new ObjectId(args.reportInput.report_id)});
    
                    if (reportData.created_by.toString() === decode.sub){
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
            }
            throw new UserInputError("Access token invalid.")
        }, 
        removeExpenseReport: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)
            
            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken){
                    const reports = db.collection('expense_reports');
                    const reportData = await reports.findOne({_id: new ObjectId(args.reportId)});
    
                    if (reportData.created_by.toString() === decode.sub){
                        const reportRemoveResult = await reports.deleteOne({_id: new ObjectId(args.reportId)});
                        return reportRemoveResult.deletedCount
                    }
                    throw new AuthenticationError("You are not authorized to remove this report")
                }
                throw new AuthenticationError("You are not authorized to remove this report")
    
            }
            throw new UserInputError("Access token invalid.")
        },
        createIncidentReport: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)
            
            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
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
                        created_by: new ObjectId(decode.sub)
                    });
                    return reportData.insertedId
                }
                throw new AuthenticationError("You are not authorized to create a report")
    
            }
        },
        updateIncidentReport: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)
            
            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken){
                    const reports = db.collection('incident_reports');
                    const reportData = await reports.findOne({_id: new ObjectId(args.reportInput.report_id)});
                    
                    if (reportData.created_by.toString() === decode.sub){
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
            }

        },
        removeIncidentReport: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)
            
            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })

                if (user && user.access_token === args.accessToken){
                    const reports = db.collection('incident_reports');
                    const reportData = await reports.findOne({_id: new ObjectId(args.reportId)});

                    if (reportData.created_by.toString() === decode.sub){
                        const reportRemoveResult = await reports.deleteOne({_id: new ObjectId(args.reportId)});
                        return reportRemoveResult.deletedCount
                    }
                    throw new AuthenticationError("You are not authorized to remove this report")
                }
                throw new AuthenticationError("You are not authorized to remove this report")
            
            }
            throw new UserInputError("Access token invalid")

        }
    }
}

