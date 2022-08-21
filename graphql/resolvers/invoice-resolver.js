import db from "../../index.js"
import { ObjectId } from "mongodb";
import {GraphQLUpload} from "graphql-upload"


export const InvoiceResolver = {
    Upload: GraphQLUpload,
    Query: {
         getInvoice: async(_, args)=>{
            const accounts = db.collection('accounts');
            const user = await accounts.findOne({_id: new ObjectId(args.accountId) })
            console.log(user)
            if (user && user.access_token === args.accessToken){
                console.log("user found")
                const invoice = db.collection('invoices');
                const invoiceData = await invoice.find({account_id: new ObjectId(args.accountId)}).toArray();
                return invoiceData;
            }
            return null;
        }
    },
    Mutation:{
        testUpload: async(_, args)=>{
            const bucket = new mongodb.GridFSBucket(db, {bucketName: 'uploads'});
            
            const {createReadStream} = await args.file

            createReadStream().pipe(bucket.openUploadStream('file'))
            .on('error', (err)=>{ console.error(err)})
            .on('finish', (file)=>{ console.log(file)})

            return "uploaded"
        }
    }
}