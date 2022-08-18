import db from "../../index.js"
import { ObjectId } from "mongodb";

export const InvoiceResolver = {
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
    }
}