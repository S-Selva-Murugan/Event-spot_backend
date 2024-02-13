const multer = require('multer')

const path = require("path")

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'Uploads/images')
    },
    filename:(req,file,cb)=>{
        const uniqueDateName = `${Date.now() }__${file.originalname}`
        cb(null,uniqueDateName)
        // cb(null,Date.now()+file.filename+"__"+Date.now()+path.extname(file.originalname))
    }   
})

const staticpath = path.join(__dirname,"/Uploads/images")
console.log(staticpath)


module.exports = {storage,staticpath}