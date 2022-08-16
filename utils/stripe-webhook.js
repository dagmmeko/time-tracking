import Stripe from "stripe";
import http from 'http'
import db from '../index.js'
import { ObjectId } from "mongodb";

import dotenv from "dotenv"
dotenv.config()

const endpointSecret = "whsec_is6ZaoEp3a8iSfC4hyLxCAMcfhiP3hoc"
const stripe = new Stripe(process.env.STRIPE_SK)

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
            const session = event.data.object
            
            if (session && session.metadata && session.metadata.account_id){
                console.log({i: session.metadata.account_id})
                const accounts = db.collection('accounts')
                await accounts.findOneAndUpdate({_id: new ObjectId(session.metadata.account_id)}, {$set: {payment_status: true}})
            }

            break;
    }

    // Return a 200 response to acknowledge receipt of the event
    res.statusCode = 200;
    res.end()
  }  
})

server.listen(9000);
