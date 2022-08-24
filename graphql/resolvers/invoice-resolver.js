import db from "../../index.js"
import { ObjectId } from "mongodb";
import {GraphQLUpload} from "graphql-upload"
import jwt from "jsonwebtoken"
import { UserInputError } from "apollo-server";

export const InvoiceResolver = {
    Upload: GraphQLUpload,
    Query: {
        getInvoice: async(_, args)=>{
            var decode = jwt.verify(args.accessToken, process.env.JWT_SECRET)
            if (decode){
                const accounts = db.collection('accounts');
                const user = await accounts.findOne({_id: new ObjectId(decode.sub) })

                if (user){
                    
                    const invoice = db.collection('invoices');
                    const invoiceData = await invoice.find({account_id: new ObjectId(decode.sub)}).toArray();
                    return invoiceData;
                }
                throw new UserInputError("User not found")
            }
            throw new UserInputError("Access token invalid.")
        }
    }
}