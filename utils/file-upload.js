import AWS from 'aws-sdk'
import dotenv from "dotenv"
dotenv.config()

const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRETE_KEY,
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
})

export async function uploadFile(key) {
    const url = await new Promise((resolve, reject)=>{
        s3.getSignedUrl('putObject', {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Expires: 3600
        }, (err, res)=>{
            if (err){
                reject(err)
                console.log({FileUploadErr: err})
            }
            else {
                resolve(res)
                console.log({FileUploadSuc: res})
            }
        })
    }) 

    return url
}

export async function getFile(key) {
    const url = await new Promise((resolve, reject)=> {
        s3.getSignedUrl('getObject',{
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Expires: 3600
        }, (err, res)=>{
            if(err){
                reject(err)
                console.log({FileGetErr: err})
            }
            else {
                resolve(res)
                console.log({FileGetSuc: res})
            }
        })
    })
    return url
}