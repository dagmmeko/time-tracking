import db from "../../index.js"
import { ObjectId } from "mongodb";
import {AuthenticationError, UserInputError} from "apollo-server"
import jwt from "jsonwebtoken"


export const TaskResolver = {
    Query: {
        getTaskListByManager: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
                
                if (user && user.access_token === args.accessToken, user.account_type === "MANAGER"){
                    const tasks = db.collection('tasks');
                    const taskData = await tasks.find({created_by: new ObjectId(decode.sub), status: args.status}).toArray();
    
                    return taskData
                }
                throw new AuthenticationError("You are not authorized to get tasks")
    
            }
            throw new UserInputError("Access token invalid")

        },
        getTaskListByWorkerId: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })

                if (user && user.access_token === args.accessToken, user.account_type === "WORKER"){
                    const tasks = db.collection('tasks');
                    const taskData = await tasks.find({assigned_to: {$in: [new ObjectId(decode.sub)]}, status: args.status}).toArray();
                    if (taskData.length > 0){
                        return taskData
                    }
                    throw new UserInputError("You have no tasks")
                }
                throw new AuthenticationError("You are not authorized to get tasks") 
            }

            throw new UserInputError("Access token invalid")
        },
        getTaskDetailById: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken){
                    const tasks = db.collection('tasks');
                    const taskData = await tasks.findOne({_id: new ObjectId(args.taskId)});
                    
                    const taskFoundForWorker = taskData.assigned_to.find(assigned_to => assigned_to.toString() === decode.sub)
    
                    if (taskFoundForWorker || taskData.created_by.toString() === decode.sub){
                        return taskData
                    }
                    throw new AuthenticationError("You are not authorized to get this task")
                }
                throw new AuthenticationError("You are not authorized to get this task")  
            }
            throw new UserInputError("Access token invalid")
        },
        getCommentByTaskId: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');

                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken){
                    const tasks = db.collection('tasks');
                    const taskData = await tasks.findOne({_id: new ObjectId(args.taskId)});
                    if (taskData.assigned_to.toString() === decode.sub || taskData.created_by.toString() === decode.sub){
                        const comments = db.collection('comments');
                        const commentData = await comments.find({task_id: new ObjectId(args.taskId)}).toArray();
                        return commentData
                    }
                    throw new AuthenticationError("You are not authorized to get this task")
                }
                throw new AuthenticationError("You are not authorized to get this task")
    
            }

            throw new UserInputError("Access token invalid")
        }
    },
    Mutation: {
        createTaskByManagerId: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
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
    
            }

            throw new UserInputError("Access token invalid")
        }, 
        allocateTaskByManagerId: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken, user.account_type === "MANAGER"){
                    const assignedTo = [];
                    args.taskInput.assigned_to ? args.taskInput.assigned_to.forEach(async(item)=>{
                        assignedTo.push(new ObjectId(item))
                    }) : null
    
                    const taskUpdate = db.collection('tasks');
                    const task = await taskUpdate.findOne({_id: new ObjectId(args.taskInput.task_id)});
                    if (task.created_by.toString() === decode.sub){
                        const taskUpdateResult = await taskUpdate.updateOne(
                            {_id: new ObjectId(args.taskInput.task_id)}, 
                            {$set: {
                                updated_at: new Date(),
                                task_name: args.taskInput.task_name || task.task_name,
                                category: args.taskInput.category || task.category,
                                assigned_to: assignedTo || task.assigned_to,
                                task_description: args.taskInput.task_description || task.task_description,
                                task_due_date: args.taskInput.task_due_date || task.task_due_date,
                            }}
                        )
    
                        return taskUpdateResult.modifiedCount;  
                    }
                    throw new UserInputError("Task not found")
                }
                throw new AuthenticationError("You are not authorized to update this task")
    
            }

            throw new UserInputError("Access token invalid")
        },
        removeTaskByManagerId: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken, user.account_type === "MANAGER"){
                    const tasks = db.collection('tasks');
                    const taskData = await tasks.findOne({_id: new ObjectId(args.taskId)});
                    if (taskData.created_by.toString() === decode.sub){
                        const taskRemove = db.collection('tasks');
                        const taskRemoveData = await taskRemove.deleteOne({_id: new ObjectId(args.taskId)});
                        return taskRemoveData.deletedCount;
                    }
                    throw new AuthenticationError("You are not authorized to remove this task")
                }
                throw new AuthenticationError("You are not authorized to remove this task")
            
            }
            throw new UserInputError("Access token invalid")
        },
        createComment: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken){
                    const task = db.collection('tasks');
                    const taskData = await task.findOne({_id: new ObjectId(args.commentInput.task_id)});
    
                    if (taskData.assigned_to.toString() === decode.sub || taskData.created_by.toString() === decode.sub){
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
    
            }

            throw new UserInputError("Access token invalid")
        },
        removeCommentById: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })
    
                if (user && user.access_token === args.accessToken){
                    const comment = db.collection('comments');
                    const commentData = await comment.findOne({_id: new ObjectId(args.commentId)});
    
                    if (commentData.commented_by.toString() === decode.sub){
                        const commentRemoveResult = await comment.deleteOne({_id: new ObjectId(args.commentId)});
                        console.log(commentRemoveResult)
                        return commentRemoveResult.deletedCount;
                    }
                    throw new AuthenticationError("You are not authorized to remove this comment")
                    
                }
                throw new AuthenticationError("You are not authorized to remove this comment")
            
            }

            throw new UserInputError("Access token invalid")
        },
        changeTaskStatusByWorker: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })

                if (user && user.access_token === args.accessToken){
                    const tasks = db.collection('tasks');
                    const taskData = await tasks.findOne({_id: new ObjectId(args.taskId)});
                    const taskFoundForWorker = taskData.assigned_to.find(assigned_to => assigned_to.toString() === decode.sub)

                    if (taskFoundForWorker){

                        const taskUpdateData = await tasks.updateOne({_id: new ObjectId(args.taskId)}, {$set: {status: args.status}});
                        return taskUpdateData.modifiedCount;
                    }
                    throw new AuthenticationError("You are not authorized to change this task status")
                }
                throw new AuthenticationError("You are not authorized to change this task status")
            }

            throw new UserInputError("Access token invalid")
        }
    }
}