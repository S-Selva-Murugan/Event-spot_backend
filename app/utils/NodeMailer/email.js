const nodemailer = require("nodemailer")

const funEmail =async (options)=>{
    //create a  transport
    const transport = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWARD

        }

    })

    const emailOptions = {
        from:process.env.EMAIL_USER,
        to:options.email,
        subject:options.subject,
        text:options.message


    }

    try{

        await transport.sendMail(emailOptions)
        console.log("Email send Successfully")
    }catch(err){
        console.log(err)
        
    }



}

module.exports = funEmail