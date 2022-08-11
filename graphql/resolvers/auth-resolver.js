import db from "../../db.js"
import mongo, { ObjectId } from "mongodb";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {GraphQLUpload} from "graphql-upload"
import Grid from "gridfs-stream"
import sendMail from "../../utils/sendmail.js";


export const AuthResolver = {
    Upload: GraphQLUpload,
    
    Query: {

       getAccount: async(_, args) => {
            const collection = db.collection('accounts');
           const user = await collection.findOne({_id: new ObjectId(args.id) })
           console.log(user)
           if (args.access_token !== null && user.access_token === args.access_token)
            return user
           else 
            return  
       }
   },
   Mutation: {
    createAccount: async(_, args) => {
        console.log(args)

        const collection = db.collection('accounts');
        const user = await collection.findOne({
            email: args.accountInput.email
        })
        if (user){
            return {
                access_token: "",
                status: false
            }
        }

        // var gfs = Grid(db, mongo)

        // var writestream = gfs.createWriteStream({
        //     filename: args.accountInput.name
        // });
        // fs.createReadStream(args.image).pipe(writestream);


        const token = jwt.sign({sub:  args.accountInput.name},  args.accountInput.email)
        args.accountInput.password = bcrypt.hashSync(args.accountInput.password, 10)
        args.accountInput.access_token = token

        const accData = await collection.insertOne(args.accountInput)
        
        return {
            access_token: token,
            status: true
        }
    },

    login: async(_, args) =>{
        const collection = db.collection('accounts')
        const user = await collection.findOne({email: args.email})
        console.log(user)
        if (user && bcrypt.compareSync(args.password, user.password)){
            const token = jwt.sign({sub: user.name}, args.email)

            await collection.updateOne({_id: user._id}, {$set: { access_token: token } })

            return {
                access_token: token,
                status: true
            }
        }
        return {
            access_token: "",
            status: false
        }
    },
    logout: async(_, args)=>{
        const collection = db.collection('accounts');
        const user = await collection.findOne({_id: new ObjectId(args.id) })
        
        const val = await collection.updateOne({_id: user._id}, {$set: { access_token: null } })
        if (val){
            return true
        }
    },
    resetPassword: async(_, args)=>{

        const collection = db.collection('accounts')
        const user = await collection.findOne({email: args.email})

        if (user){
            await sendMail(args.email)
        }

        return false
    }
    
   }
}