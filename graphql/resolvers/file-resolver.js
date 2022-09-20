import db from "../../index.js"
import { AuthenticationError, UserInputError } from "apollo-server";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';
import {uploadFile, getFile, deleteFile} from "../../utils/file-upload.js";
import jwt from "jsonwebtoken"


export const FileResolver = {
    Query: {
        getFile: async(_, args, context) => {
            var decode = jwt.verify(context.token, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts');
                const user = accounts.findOne({_id: new ObjectId(decode.sub)})

                if (user){
                    if (args.fileType === "ACCOUNT"){
                        const url = await getFile(`${args.fileType}/${decode.sub}`)
                        if (url){
                            return url
                        }
                        throw new UserInputError("File can not be found")
                    }
                    else if (args.fileType === "TASK" || args.fileType === "COMMENT"){
                        const url = await getFile(`${args.fileType}/${args.fileId}`)
                        if (url){
                            return url
                        }
                        throw new UserInputError("File can not be found")
                    }
                    else
                        throw new UserInputError("File type check failed!")
                }
                throw new UserInputError("User not found")
            }
        }
    },
    Mutation: {
        createFile: async (_, args, context) => {
            var decode = jwt.verify(context.token, process.env.JWT_SECRET)            

            if (decode){
                const accounts = db.collection('accounts')

                const user = await accounts.findOne({_id: new ObjectId(decode.sub)})

                if (user){
                    if (args.fileType === "ACCOUNT"){
                        const url = await uploadFile(`${args.fileType}/${decode.sub}`)
                        if (url){
                            return {
                                url: url,
                                file_id: decode.sub
                            }
                        }
                        
                        throw new UserInputError("File Upload link generation failed.")
                        
                    }
                    else if (args.fileType === "TASK"){
                        const new_file_id = uuidv4()
                        const tasks = db.collection('tasks')
                        const taskFound = await tasks.findOne({created_by: new ObjectId(decode.sub)})
                                                
                        if (taskFound){ 
                            const url = await uploadFile(`${args.fileType}/${new_file_id}`)

                            if (url){
                                return {
                                    url: url,
                                    file_id: new_file_id
                                }
                            }
                            throw new UserInputError("File Upload link generation failed.")
                            
                        }
                        throw new AuthenticationError("No Tasks found created by this user!")
                    }
                    else if (args.fileType === "COMMENT"){
                        const new_file_id = uuidv4()
                        const tasks = db.collection('tasks')
                        const taskFound = await tasks.findOne({$or: [
                            {created_by: new ObjectId(decode.sub)},
                            {assigned_to: new ObjectId(decode.sub)}
                        ]})

                        if (taskFound){ 
                            const url = await uploadFile(`${args.fileType}/${new_file_id}`)

                            if (url){
                                return {
                                    url: url,
                                    file_id: new_file_id
                                }
                            }
                            throw new UserInputError("File Upload link generation failed.")
                            
                        }
                        throw new AuthenticationError("No Tasks found for this user")
                        
                    }
                }
                throw new UserInputError("User not found")
            }
        },
        fileUploadSuccess: async (_, args, context)=>{
            var decode = jwt.verify(context.token, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts')
                const user = await accounts.findOne({_id: new ObjectId(decode.sub)})

                if (user){
                    if (args.fileType === "TASK"){
                        const tasks = db.collection('tasks')
                        const taskData = await tasks.findOne({_id: new ObjectId(args.collectionId)})
                        if (taskData){
                            taskData.file_ids = [...taskData.file_ids, args.fileId]

                            await tasks.updateOne(
                                {_id: new ObjectId(args.collectionId)},
                                {$set: {
                                    file_ids: taskData.file_ids
                                }}
                            )

                            return `${args.fileType} has been updated with file id!`
                        }
                                        
                    }
                    else if (args.fileType === "COMMENT"){
                        const comments = db.collection('comments')
                        const commentData = await comments.findOne({_id: new ObjectId(args.collectionId)})

                        if (commentData){
                            commentData.file_ids = [...commentData.file_ids, args.fileId]
                            
                            await comments.updateOne(
                                {_id: new ObjectId(args.collectionId)},
                                {$set: {
                                    file_ids: commentData.file_ids
                                }}
                            )

                            return `${args.fileType} has been updated with file id!`
                        }
                    }
                    else if (args.fileType === "ACCOUNT"){
                        return `${args.fileType} has been updated with file id!`
                    }
                }
            }
        },
        deleteFile: async (_, args, context) => {
            var decode = jwt.verify(context.token, process.env.JWT_SECRET)

            if (decode){
                const accounts = db.collection('accounts')
                const user = await accounts.findOne({_id: new ObjectId(decode.sub)})

                if (user){
                    if (args.fileType === "ACCOUNT"){
                       const url = await deleteFile(`${args.fileType}/${decode.sub}`) 
                       console.log(url)
                       return true
                    }
                    else if (args.fileType === "TASK" || args.fileType === "COMMENT"){
                        const url = await deleteFile(`${args.fileType}/${args.fileId}`)
                        console.log(url) 
                        return true
                    }
                }
                throw new UserInputError("User not found")
            }
        }
    }
}