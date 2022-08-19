import db from "../../index.js"
import mongodb, { ObjectId } from "mongodb";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {GraphQLUpload} from "graphql-upload"
import GraphQLJSON from 'graphql-type-json';
import sendMail from "../../utils/sendmail.js";
import {generateRegistrationChallenge,
    parseRegisterRequest,
    generateLoginChallenge,
    parseLoginRequest,
    verifyAuthenticatorAssertion} from "@webauthn/server"
import { v4 as uuidv4 } from 'uuid';
import Stripe from "stripe";
import { AuthenticationError, UserInputError } from "apollo-server";

export const AuthResolver = {
    Upload: GraphQLUpload,
    JSON: GraphQLJSON,
    Query: {
       getAccount: async(_, args) => {
            const collection = db.collection('accounts');
           const user = await collection.findOne({_id: new ObjectId(args.id) })
           if (user && args.access_token !== null && user.access_token === args.access_token)
            return user
           else 
            return  
       }
   },
   Mutation: {
    createAccount: async(_, args) => {
        
        const collection = db.collection('accounts');

        var mailFormat = /\S+@\S+\.\S+/

        if (!mailFormat.test(args.accountInput.email)){
            throw new AuthenticationError("Invalid email format")
        }
        const user = await collection.findOne({
            email: args.accountInput.email
        })
        if (user){
            throw new UserInputError("Email already exists")
        }

        const token = jwt.sign({sub:  args.accountInput.email}, process.env.JWT_SECRETE)

        const accountInput = {
            created_at: new Date(),
            updated_at: null,
            deleted_at: null,
    
            name: args.accountInput.name,
    
            email: args.accountInput.email,
            account_type: args.accountInput.account_type,
            password: bcrypt.hashSync(args.accountInput.password, 10),
            payment_plan: null,
            payment_status: false,
            reset_token: null,
            reset_token_time: null,
            access_token: token,
            stripe_subscription_id: null
        }

        const insertedUser = await collection.insertOne(accountInput)

        // const bucket = new mongodb.GridFSBucket(db, { bucketName: 'accountImage' });

        // const {createReadStream } = await args.image

        // createReadStream().pipe(bucket.openUploadStream(insertedUser._id.toString(), {
        //  metadata: { account_id: insertedUser._id.toString() }
        // }))
        
        return {
            access_token: token,
            status: true
        }
    },
    login: async(_, args) =>{
        const collection = db.collection('accounts')
        const user = await collection.findOne({email: args.email})

        if (user && bcrypt.compareSync(args.password, user.password)){
            const token = jwt.sign({sub: user.email}, process.env.JWT_SECRETE)

            await collection.updateOne({_id: user._id}, {$set: { access_token: token } })

            return {
                access_token: token,
                status: true
            }
        }
        throw new AuthenticationError("Invalid email or password")
    },
    logout: async(_, args)=>{
        const collection = db.collection('accounts');
        const user = await collection.findOne({_id: new ObjectId(args.id) })
        
        const val = await collection.updateOne({_id: user._id}, {$set: { access_token: null } })
        if (val){
            return true
        }
        throw new UserInputError("Error logging out")
    },
    requestResetPassword: async(_, args)=>{
        const collection = db.collection('accounts')
        var mailFormat = /\S+@\S+\.\S+/

        if (!mailFormat.test(args.email)){
            const user = await collection.findOne({email: args.email})

            if (user){
                const token = jwt.sign({sub: user._id.toString() },  process.env.JWT_SECRETE , {expiresIn: '1h'})

                const val = await sendMail(args.email, token)
                if (val){
                    await collection.updateOne({_id: user._id}, {$set: { reset_token: token, reset_token_time: new Date() } })
                    return true
                }
                throw new UserInputError("Error sending email")
            }

            throw new AuthenticationError("User not found")
        }
        throw new AuthenticationError("Wrong email format")
        
    },
    resetPassword: async(_, args)=>{
        var decode = jwt.verify(args.resetTokenInput.resetToken, process.env.JWT_SECRETE)
        
        if (decode){
            const collection = db.collection('accounts')
            const user = await collection.findOne({_id: new ObjectId(decode.sub)})
            if (user){
                const val = await collection.updateOne({_id: user._id}, {$set: { password: bcrypt.hashSync(args.resetTokenInput.password, 10), reset_token: null, reset_token_time: null } })
                if (val){
                    return true
                }
                throw new AuthenticationError("Error updating password")
            } 
        }
        throw new AuthenticationError("Invalid token")        
    },
    requestRegister: async(_, args)=>{
        const challengeResponse = generateRegistrationChallenge({
            relyingParty: {name: args.email},
            user: {id: uuidv4(), name: args.email}
        })

        const collection = db.collection('request_registers')
        const user = await collection.findOne({email: args.email})        
        if (user){
            throw new UserInputError('Invalid argument value');        
        }
        await collection.insertOne({
            id: challengeResponse.user.id, 
            email: args.email, 
            challenge: challengeResponse.challenge 
        })

        return challengeResponse
    },
    registerBiometric: async(_,args)=>{
        const {key, challenge} = parseRegisterRequest(args)

        const request_register = db.collection('request_registers')
        const accounts = db.collection('accounts')
        const user = request_register.findOne({
            challenge: challenge 
        })

        if(!user) {
            throw new AuthenticationError('Invalid challenge')
        }

        await request_register.updateOne({_id: user._id}, {$set: {key: key}})

        const token = jwt.sign({sub:  user.id},  process.env.JWT_SECRETE)

        const accountInput = {
            created_at: new Date(),
            updated_at: null,
            deleted_at: null,
    
            name: null,
    
            email: user.email,
            account_type: null,
            password: null,
            payment_plan: null,
            payment_status: false,
            reset_token: null,
            reset_token_time: null,
            access_token: token
        }
        
        await accounts.insertOne(accountInput)

        return {
            access_token: token,
            status: true,
        }
    },
    requestLoginChallenge: async (_, args) => {
        const request_register = db.collection('request_registers')

        const challengeData = request_register.findOne({email: args.email})
        if(!challengeData){
            throw new AuthenticationError('Invalid email')
        }

        const loginChallenge = generateLoginChallenge(request_register.key)

        await request_register.updateOne({id: challengeData._id}, {$set: {challenge: loginChallenge.challenge }})

        return loginChallenge
    },
    loginBiometric: async (_, args) => {
        const {challenge, keyId} = parseLoginRequest(args)

        if (!challenge) {
            throw new AuthenticationError('Can not create challenge')
        }
        const request_register = db.collection('request_register')
        const challengeData = request_register.findOne({challenge: challenge})

        if (!challengeData, !challengeData.key, challengeData.key.credID !== keyId){
            throw new AuthenticationError('Invalid challenge')
        }

        const loggedIn = verifyAuthenticatorAssertion(args, challengeData.key)

        const token = jwt.sign({sub: challengeData.id}, process.env.JWT_SECRETE)
        const accounts = db.collection('accounts')

        await accounts.updateOne({email: challengeData.email}, {$set: {
            access_token: token
        }})

        return {
            access_token: token,
            status: true
        }
    },
    choosePaymentPlan: async(_, args) =>{
        const accounts = db.collection('accounts')
        const user = await accounts.findOne({_id: new ObjectId(args.account_id)})

        if (user && user.access_token === args.access_token && user.account_type === "COMPANY_REPRESENTATIVE"){
            await accounts.updateOne({_id: user._id}, {$set: {payment_plan: args.payment_plan}})
            return true
        }
        throw new UserInputError("Error choosing payment plan")
    },
    createStripeCheckout: async(_, args)=>{
        const stripe = new Stripe(process.env.STRIPE_SK)
        const accounts= db.collection('accounts')
        const payment_plan = db.collection('payment_plans')
        
        const user = await accounts.findOne({_id: new ObjectId(args.account_id)})

        
        if (user && user.access_token === args.access_token && user.account_type === "COMPANY_REPRESENTATIVE"){
            const payment_price = await payment_plan.findOne({type: user.payment_plan})
            const session = await stripe.checkout.sessions.create({
                line_items: [{
                    price: payment_price.price_id,
                    quantity: 1
                }],
                mode: "subscription",
                success_url: args.success_url,
                cancel_url: args.cancel_url,
                metadata: {
                    account_id: args.account_id
                }
            })

            // console.log(session.url)

            return session.url
        }
        throw new UserInputError("Failed to create Checkout session")
    }
   }
}