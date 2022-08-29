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
        getAccount: async(_, args, context) => {
            var decode = jwt.verify(context.token, process.env.JWT_SECRET)

            if (decode){
                const collection = db.collection('accounts');
                const user = await collection.findOne({_id: new ObjectId(decode.sub) })

                if (user)
                    return user
                else 
                    throw new UserInputError("User not found")  

            }
            throw new UserInputError("Access Token incorrect!")
      
        },
        getPaymentPlans: async (_, args, context)=>{
            const plans = db.collection('payment_plans')
            const data = await plans.find().toArray()
            if (data){
                return data
            }
            throw new UserInputError("Payment Plans not found!")
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
        if (!user){

            const accountInput = {
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
        
                name: args.accountInput.name,
        
                email: args.accountInput.email,
                account_type: args.accountInput.account_type,
                password: bcrypt.hashSync(args.accountInput.password, 10),
                payment_plan_id: null,
                payment_status: false,
                reset_token: null,
                reset_token_time: null,
                access_token: null,
                stripe_subscription_id: null
            }

            const insertedUser = await collection.insertOne(accountInput)

            if (insertedUser) {
                const token = jwt.sign({sub:  insertedUser.insertedId}, process.env.JWT_SECRET)
                await collection.updateOne({_id: insertedUser.insertedId}, {$set: {access_token: token}})

                return  token
            }
            throw new UserInputError("Error assigning access token")
            // const bucket = new mongodb.GridFSBucket(db, { bucketName: 'accountImage' });

            // const {createReadStream } = await args.image

            // createReadStream().pipe(bucket.openUploadStream(insertedUser._id.toString(), {
            //  metadata: { account_id: insertedUser._id.toString() }
            // }))
        
            
        }
        throw new UserInputError("Email already exists")

        
    },
    login: async(_, args) =>{
        const collection = db.collection('accounts')
        const user = await collection.findOne({email: args.email})

        if (user && bcrypt.compareSync(args.password, user.password)){
            const token = jwt.sign({sub: user._id}, process.env.JWT_SECRET)

            await collection.updateOne({_id: user._id}, {$set: { access_token: token } })
            

            return token
        }
        throw new AuthenticationError("Invalid email or password")
    },
    logout: async(_, args, context)=>{
        var decode = jwt.verify(context.token, process.env.JWT_SECRET)

        if (decode){
            const collection = db.collection('accounts');
            const user = await collection.findOne({_id: new ObjectId(decode.sub) })
            console.log(user)

            const val = await collection.updateOne({_id: user._id}, {$set: { access_token: null } })
            if (val){
                return true
            }
            throw new UserInputError("Error logging out")
        }
        throw new UserInputError("Access token invalid.")
    },
    requestResetPassword: async(_, args)=>{
        const collection = db.collection('accounts')
        var mailFormat = /\S+@\S+\.\S+/

        if (!mailFormat.test(args.email)){
            const user = await collection.findOne({email: args.email})

            if (user){
                const token = jwt.sign({sub: user._id.toString() },  process.env.JWT_SECRET , {expiresIn: '1h'})

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
        var decode = jwt.verify(args.resetTokenInput.resetToken, process.env.JWT_SECRET)
        
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

        const collection = db.collection('requestRegisters')
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

        const requestRegister = db.collection('request_registers')
        const accounts = db.collection('accounts') 
        const user = requestRegister.findOne({
            challenge: challenge 
        })

        if(!user) {
            throw new AuthenticationError('Invalid challenge')
        }

        await requestRegister.updateOne({_id: user._id}, {$set: {key: key}})

        const token = jwt.sign({sub:  user.id},  process.env.JWT_SECRET)

        const accountInput = {
            created_at: new Date(),
            updated_at: null,
            deleted_at: null,
    
            name: null,
    
            email: user.email,
            account_type: null,
            password: null,
            payment_plan_id: null,
            payment_status: false,
            reset_token: null,
            reset_token_time: null,
            access_token: token
        }
        
        const insertedId = await accounts.insertOne(accountInput)

        return token
    },
    requestLoginChallenge: async (_, args) => {
        const requestRegister = db.collection('requestRegisters')

        const challengeData = requestRegister.findOne({email: args.email})
        if(!challengeData){
            throw new AuthenticationError('Invalid email')
        }

        const loginChallenge = generateLoginChallenge(requestRegister.key)

        await requestRegister.updateOne({id: challengeData._id}, {$set: {challenge: loginChallenge.challenge }})

        return loginChallenge
    },
    loginBiometric: async (_, args) => {
        const {challenge, keyId} = parseLoginRequest(args)

        if (!challenge) {
            throw new AuthenticationError('Can not create challenge')
        }
        const requestRegister = db.collection('requestRegister')
        const challengeData = requestRegister.findOne({challenge: challenge})

        if (!challengeData, !challengeData.key, challengeData.key.credID !== keyId){
            throw new AuthenticationError('Invalid challenge')
        }

        const loggedIn = verifyAuthenticatorAssertion(args, challengeData.key)

        const token = jwt.sign({sub: challengeData.id}, process.env.JWT_SECRET)
        const accounts = db.collection('accounts')

        await accounts.updateOne({email: challengeData.email}, {$set: {
            access_token: token
        }})

        return token
    },
    choosePaymentPlan: async(_, args, context) =>{
        var decode = jwt.verify(context.token, process.env.JWT_SECRET)

        if (decode){
            const accounts = db.collection('accounts')
            const user = await accounts.findOne({_id: new ObjectId(decode.sub)})

            if (user && user.account_type === "COMPANY_REPRESENTATIVE"){
                await accounts.updateOne({_id: user._id}, {$set: {payment_plan_id: args.paymentPlanId}})
                return true
            }
            throw new UserInputError("Error choosing payment plan")
        }
        throw new UserInputError("Access token invalid.")
    },
    createStripeCheckout: async(_, args, context)=>{
        var decode = jwt.verify(context.token, process.env.JWT_SECRET)

        if (decode) {
            const stripe = new Stripe(process.env.STRIPE_SK)
            const accounts= db.collection('accounts')
            const paymentPlan = db.collection('payment_plans')
            
            const user = await accounts.findOne({_id: new ObjectId(decode.sub)})

            
            if (user && user.account_type === "COMPANY_REPRESENTATIVE"){
                const payment_price = await paymentPlan.findOne({_id: new ObjectId(user.payment_plan_id) })
                const session = await stripe.checkout.sessions.create({
                    line_items: [{
                        price: payment_price.plan_price_id,
                        quantity: 1
                    }],
                    mode: "subscription",
                    success_url: args.successUrl,
                    cancel_url: args.cancelUrl,
                    metadata: {
                        account_id: user._id
                    }
                })

                return session.url
            }
            throw new UserInputError("Failed to create Checkout session")
        }
        throw new UserInputError("Access token invalid.")
        
    },
    createPaymentPlan: async(_, args, context)=>{
        var decode = jwt.verify(context.token, process.env.JWT_SECRET)

        if (decode) {
            const account = db.collection('accounts')
            const paymentPlan = db.collection('payment_plans')    
            const user = await account.findOne({_id: new ObjectId(decode.sub)})

            if (user){
                const planData = {
                    created_at: new Date(),
                    updated_at: null,
                    deleted_at: null,

                    plan_name: args.paymentPlanInput.plan_name,
                    plan_description: args.paymentPlanInput.plan_description,
                    plan_price_id: args.paymentPlanInput.plan_price_id
                } 
                const plan = await paymentPlan.insertOne(planData)

                return plan.insertedId
            }
        }
    }
   }
}