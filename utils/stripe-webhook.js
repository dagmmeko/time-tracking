import Stripe from "stripe";
import http from 'http'
import db from '../index.js'
import { ObjectId } from "mongodb";

import dotenv from "dotenv"
dotenv.config()

const endpointSecret = "whsec_is6ZaoEp3a8iSfC4hyLxCAMcfhiP3hoc"

const server = http.createServer(async (req, res) => {
    const body = await new Promise((resolve)=>{
        req.setEncoding('utf8');
        const rb = [];
        req.on('data', (chunks)=>{
            rb.push(chunks);
        });
        req.on('end', ()=>{
            const body=rb.join("");
            resolve(body)
        });
    })
    
  
  if (req.method.toUpperCase() === "POST" && req.url === '/webhook'){
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = Stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        res.statusCode = 400
        res.write(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const sessionCompleted = event.data.object
            const accountsCompleted = db.collection('accounts')

            if (sessionCompleted && sessionCompleted.metadata && sessionCompleted.metadata.account_id){
                await accountsCompleted.findOneAndUpdate({_id: new ObjectId(sessionCompleted.metadata.account_id)}, 
                {$set: {payment_status: true, stripe_subscription_id: sessionCompleted.subscription}})     
            }

            break;
        case 'checkout.session.async_payment_succeeded':
            const sessionAsync = event.data.object
            const accountsAsync = db.collection('accounts')
            
            if (sessionAsync && sessionAsync.metadata && sessionAsync.metadata.account_id){
                await accountsAsync.findOneAndUpdate({_id: new ObjectId(sessionAsync.metadata.account_id)},
                 {$set: {payment_status: true, stripe_subscription_id: sessionAsync.subscription}})
            }
            break;
        case 'invoice.paid':
            const sessionInvoicePaid = event.data.object
            const accountsInvoicePaid = db.collection('accounts')
            console.log({session: sessionInvoicePaid})
            if (sessionInvoicePaid && sessionInvoicePaid.subscription){   
                await accountsInvoicePaid.findOneAndUpdate({stripe_subscription_id: sessionInvoicePaid.subscription},
                 {$set: {payment_status: true}})
            }
            
            const userInvoice = await accountsInvoicePaid.findOne({stripe_subscription_id: sessionInvoicePaid.subscription})
            if (userInvoice){
                const invoicePaid = db.collection('invoices')
                const invoicePaidData = {
                    account_id: userInvoice._id,
                    invoice_date: new Date(),
                    payment_plan: userInvoice.payment_plan,
                    amount: sessionInvoicePaid.amount_paid,
                    payment_method: "STRIPE",
                    payment_status: true,
                    invoice_documents: sessionInvoicePaid.invoice_pdf
                }
                await invoicePaid.insertOne(invoicePaidData)
            }

            break;
        case 'invoice.payment_failed':
            const sessionPaymentFailed = event.data.object
            const accountsPaymentFailed = db.collection('accounts')

            console.log({session: sessionPaymentFailed})
            
            if (sessionPaymentFailed && sessionPaymentFailed.subscription){
                await accountsPaymentFailed.findOneAndUpdate({stripe_subscription_id: sessionPaymentFailed.subscription},
                 {$set: {payment_status: false}})
            }

            const userInvoiceFailed = await accountsPaymentFailed.findOne({stripe_subscription_id: sessionPaymentFailed.subscription})
            if (userInvoiceFailed){
                const invoiceFailed = db.collection('invoices')
                const invoiceFailedData = {
                    account_id: userInvoiceFailed._id,
                    invoice_date: new Date(),
                    payment_plan: userInvoiceFailed.payment_plan,
                    amount: null,
                    payment_method: "STRIPE",
                    payment_status: false,
                    invoice_documents: sessionPaymentFailed.invoice_pdf
                }
                await invoiceFailed.insertOne(invoiceFailedData)
            }
            
            break;
        case 'customer.subscription.deleted':
            const sessionDeleted = event.data.object
            const accountsDeleted = db.collection('accounts')
            if (sessionDeleted && sessionDeleted.id){
                await accountsDeleted.findOneAndUpdate({stripe_subscription_id: sessionDeleted.id},
                    {$set: {payment_status: false}})
            }
            break;
    }

    // Return a 200 response to acknowledge receipt of the event
    res.statusCode = 200;
    res.end()
  }  
})

server.listen(9000);
