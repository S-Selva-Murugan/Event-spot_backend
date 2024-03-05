const multers3 = require('multer-s3')
const {S3Client} = require('@aws-sdk/client-s3')
const multer = require("multer")


const client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
})

const profileUpload = multer({
    storage : multers3({
        s3 : client, 
        bucket : "eventpot",
        acl : "public-read",
        contentType : multers3.AUTO_CONTENT_TYPE,
        key : function (req,file,cb){
            cb(null, "profile/" + `${Date.now() }__${file.originalname}`)
        }
    })
})
const eventUpload = multer({
    storage : multers3({
        s3 : client, 
        bucket : "eventpot",
        acl : "public-read",
        contentType : multers3.AUTO_CONTENT_TYPE,
        key : function (req,file,cb){
            cb(null, "eventPhoto/" + `${Date.now() }__${file.originalname}`)
        }
    })
})

const categotyUpload = multer({
    storage : multers3({
        s3 : client, 
        bucket : "eventpot",
        acl : "public-read",
        contentType : multers3.AUTO_CONTENT_TYPE,
        key : function (req,file,cb){
            cb(null, "categoryImage/" + `${Date.now() }__${file.originalname}`)
        }
    })
})


module.exports={profileUpload,eventUpload,categotyUpload}