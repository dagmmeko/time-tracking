import db from "../../db.js"
import mongo, { ObjectId } from "mongodb";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {GraphQLUpload} from "graphql-upload"
import GraphQLJSON from 'graphql-type-json';
import Grid from "gridfs-stream"
import sendMail from "../../utils/sendmail.js";
import {generateRegistrationChallenge,
    parseRegisterRequest,
    generateLoginChallenge,
    parseLoginRequest,
    verifyAuthenticatorAssertion} from "@webauthn/server"
    import { v4 as uuidv4 } from 'uuid';

export const AuthResolver = {
    Upload: GraphQLUpload,
    JSON: GraphQLJSON,
    Query: {
       getAccount: async(_, args) => {
            const collection = db.collection('accounts');
           const user = await collection.findOne({_id: new ObjectId(args.id) })
           if (args.access_token !== null && user.access_token === args.access_token)
            return user
           else 
            return  
       }
   },
   Mutation: {
    createAccount: async(_, args) => {

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

        const token = jwt.sign({sub:  args.accountInput.name},  args.accountInput.email)

        const accountInput = {
            created_at: new Date(),
            updated_at: null,
            deleted_at: null,
    
            name: args.accountInput.name,
    
            email: args.accountInput.email,
            account_type: null,
            password: bcrypt.hashSync(args.accountInput.password, 10),
            payment_plan: null,
            payment_status: false,
            reset_token: null,
            reset_token_time: null,
            access_token: token}

        await collection.insertOne(accountInput)
        
        return {
            access_token: token,
            status: true
        }
    },
    login: async(_, args) =>{
        const collection = db.collection('accounts')
        const user = await collection.findOne({email: args.email})

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
            return {
                access_token: "String",
                status: false,
            }
        }

        await request_register.updateOne({_id: user._id}, {$set: {key: key}})

        const token = jwt.sign({sub:  user.id},  user.email)

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
            return {}
        }

        const loginChallenge = generateLoginChallenge(request_register.key)

        await request_register.updateOne({id: challengeData._id}, {$set: {challenge: loginChallenge.challenge }})

        return loginChallenge
    },
    loginBiometric: async (_, args) => {
        const {challenge, keyId} = parseLoginRequest(args)

        if (!challenge) {
            return {
                access_token: "String",
                status: false
            }
        }
        const request_register = db.collection('request_register')
        const challengeData = request_register.findOne({challenge: challenge})

        if (!challengeData, !challengeData.key, challengeData.key.credID !== keyId){
            return {
                access_token: "String",
                status: false
            }
        }

        const loggedIn = verifyAuthenticatorAssertion(args, challengeData.key)

        const token = jwt.sign({sub: challengeData.id}, challengeData.email)
        const accounts = db.collection('accounts')

        await accounts.updateOne({email: challengeData.email}, {$set: {
            access_token: token
        }})

        return {
            access_token: token,
            status: true
        }
    }
   }
}