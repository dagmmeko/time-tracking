import db from "../../index.js"
import { ObjectId } from "mongodb";
import {AuthenticationError, UserInputError} from "apollo-server"


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
                const taskData = await tasks.find({assigned_to: {$in: [new ObjectId(args.accountId)]}, status: args.status}).toArray();
                
                if (taskData.length > 0){
                    return taskData

                }
                throw new UserInputError("You have no tasks")
            }

            throw new AuthenticationError("You are not authorized to get tasks")
        },
        getTaskDetailById: async(_, args)=>{
            const accounts = db.collection('accounts');

            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const tasks = db.collection('tasks');
                const taskData = await tasks.findOne({_id: new ObjectId(args.taskId)});
                
                const taskFoundForWorker = taskData.assigned_to.find(assigned_to => assigned_to.toString() === args.accountId)

                if (taskFoundForWorker || taskData.created_by.toString() === args.accountId){
                    return taskData
                }
                throw new AuthenticationError("You are not authorized to get this task")
            }
            throw new AuthenticationError("You are not authorized to get this task")
        },
        getCommentByTaskId: async(_, args)=>{
            const accounts = db.collection('accounts');

            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const tasks = db.collection('tasks');
                const taskData = await tasks.findOne({_id: new ObjectId(args.taskId)});
                if (taskData.assigned_to.toString() === args.accountId || taskData.created_by.toString() === args.accountId){
                    const comments = db.collection('comments');
                    const commentData = await comments.find({task_id: new ObjectId(args.taskId)}).toArray();
                    return commentData
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

            // console.log(args, user)

            if (user && user.access_token === args.accessToken, user.account_type === "MANAGER"){
               const assignedTo = [];
                args.taskInput.assigned_to.forEach(async(item)=>{
                    assignedTo.push(new ObjectId(item))
                })

                const taskCreate = db.collection('tasks');
                const taskCreateData = {
                    created_at: new Date(),
                    updated_at: null,
                    deleted_at: null,

                    task_name: args.taskInput.task_name,
                    category: "Category",
                    assigned_to: assignedTo,

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
        }, 
        removeTaskByManagerId: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken, user.account_type === "MANAGER"){
                const tasks = db.collection('tasks');
                const taskData = await tasks.findOne({_id: new ObjectId(args.taskId)});
                if (taskData.created_by.toString() === args.accountId){
                    const taskRemove = db.collection('tasks');
                    const taskRemoveData = await taskRemove.deleteOne({_id: new ObjectId(args.taskId)});
                    return taskRemoveData.deletedCount;
                }
                throw new AuthenticationError("You are not authorized to remove this task")
            }
            throw new AuthenticationError("You are not authorized to remove this task")
        },
        createComment: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const task = db.collection('tasks');
                const taskData = await task.findOne({_id: new ObjectId(args.commentInput.task_id)});

                if (taskData.assigned_to.toString() === args.accountId || taskData.created_by.toString() === args.accountId){
                    const comment = db.collection('comments');
                    const commentData = {
                        created_at: new Date(),
                        updated_at: null,
                        deleted_at: null,

                        commented_by: user._id,
                        comment_description: args.commentInput.comment_description,
                        task_id: taskData._id
                    }

                    const commentCreateResult = await comment.insertOne(commentData);

                    return commentCreateResult.insertedId;
                }
            }
            throw new AuthenticationError("You are not authorized to create a comment")
        },
        removeCommentById: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })

            if (user && user.access_token === args.accessToken){
                const comment = db.collection('comments');
                const commentData = await comment.findOne({_id: new ObjectId(args.commentId)});

                if (commentData.commented_by.toString() === args.accountId){
                    const commentRemoveResult = await comment.deleteOne({_id: new ObjectId(args.commentId)});
                    console.log(commentRemoveResult)
                    return commentRemoveResult.deletedCount;
                }
                throw new AuthenticationError("You are not authorized to remove this comment")
                
            }
            throw new AuthenticationError("You are not authorized to remove this comment")
        }
    }
}