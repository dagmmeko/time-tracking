import db from "../../db.js"
import { ObjectId } from "mongodb";


export const AuthResolver = {
    Query: {
       getAccount: async(_, args) => {
        const collection = db.collection('accounts');
        console.log(args.id)
           const user = await collection.findOne({_id: new ObjectId(args.id) })
           console.log("USER: ",user)
        //    62f39a513b35c58700222d84
           return user
       }
   },
   Mutation: {
    createAccount: async(_, args) => {
        console.log(args)
        const collection = db.collection('accounts');
        const user = await collection.findOne({
            email: args.email
        })
        // console.log(user)
        if (user){
            return {access_token: "",
            payload: "Account exists"}
        }
        const accData = await collection.insertOne(args.accountInput)
        // console.log(accData)
        return {
            access_token: "String",
            payload: "Created"
        }
    }
   }
}