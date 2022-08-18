import db from "../../index.js"
import { ObjectId } from "mongodb";
import {AuthenticationError} from "apollo-server"


export const TaskResolver = {
    Query: {
        getTaskListByManager: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })
            
            if (user && user.access_token === args.accessToken, user.account_type === "MANAGER"){
                const tasks = db.collection('tasks');
                const taskData = await tasks.find({created_by: new ObjectId(args.accountId), status: args.status}).toArray();
                console.log(taskData)

                return taskData
            }

            throw new AuthenticationError("You are not authorized to get tasks")
        },
        getTaskListByWorkerId: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken, user.account_type === "WORKER"){
                const tasks = db.collection('tasks');
                const taskData = await tasks.find({assigned_to: args.accountId, status: args.status}).toArray();

                return taskData
            }

            throw new AuthenticationError("You are not authorized to get tasks")
        },
        getTaskDetailById: async(_, args)=>{
            const accounts = db.collection('accounts');

            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const tasks = db.collection('tasks');
                const taskData = await tasks.findOne({_id: new ObjectId(args.taskId)});
                
                if (taskData.assigned_to.toString() === args.accountId || taskData.created_by.toString() === args.accountId){
                    return taskData
                }
                throw new AuthenticationError("You are not authorized to get this task")
            }
            throw new AuthenticationError("You are not authorized to get this task")
        }
    },
    Mutation: {
        createTaskByManagerId: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken, user.account_type === "MANAGER"){
                const taskCreate = db.collection('tasks');
                const taskCreateData = {
                    created_at: new Date(),
                    updated_at: null,
                    deleted_at: null,

                    task_name: args.taskInput.task_name,
                    category: "Category",
                    assigned_to: new ObjectId(args.taskInput.assigned_to),

                    task_description: args.taskInput.task_description,
                    task_due_date: args.taskInput.task_due_date,
                    created_by: user._id,
                    status: "NEW",

                    working_time: "0"
                }

                const taskCreateResult = await taskCreate.insertOne(taskCreateData);

                return taskCreateResult.insertedId;
            }
            throw new AuthenticationError("You are not authorized to create a task")
        }
    }
}