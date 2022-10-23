const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dontenv = require('dotenv').config();

const JWT_SECRET_KEY = "*@&@0q08qglf)&#)({}NA>CVP04q0790^5tW%@%Esnfnnfljkgshr04090&%%9860WY"


app.use(cors());
app.use(express.json());
PORT = 5000;

// connection to Mongo Atlas
const mongoUrl = "mongodb+srv://boaz:Serem3636@cluster0.8uqt73l.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(mongoUrl, { useNewUrlParser: true,})

    .then(()=> console.log("Connected to database"))

    .catch(()=>console.error("error in db"))

;

// registering api

app
    .post("/register", async (req, res)=>{

    const {fname,lname,email,password}  = req.body;

    const bcrptedPassword = await bcrypt.hash(password,10);

    try{
        // find if user with same email already exists in DB
        const oldUser = await User.findOne({email});

        if(oldUser) { return res.json({error:"User with same email already exists"}); }   

        !oldUser && await User.create({fname,lname,email,password:bcrptedPassword});
        res.send({status:"ok"})
    }

    catch(err){
        res.send({status:err})
    }
});

// logIn api
app.post ("/login",async(req,res) =>{
    // accesing the user credientials from UI form
    const {email,password} = req.body;
   // checking wether the user with the emeail exists in db
    const user = await User.findOne({email});

    if(!user) { 
        return res.json({error:"User with this email not found"}); 
    } 
    else{
        // comparing the password from user with that from db
        if (await bcrypt.compare(password, user.password)){
            // generating web token with random string
            const token =  jwt.sign({email:user.email},JWT_SECRET_KEY);

            if(res.status(201)){
                return res.json({status:"ok", data:token})
            }

            else{
                return res.json({error:"error"})
            }
        }
        else{
            return res.json({status:"error" , error:"invalid password"});
        }

    }
    
   
})

// api for obtanining user data ater logIn
app.post("/user-data", async(req,res)=>{
    const {token} =  req.body;
    console.log(token);

    try {
        // checking if token is valid
        const user = jwt.verify(token, JWT_SECRET_KEY);
        console.log({user})
        const useremail = user.email;
        // finding the user in the db using email
        User.findOne({email:useremail})
            .then((data)=>{
                // returnig the data of user to the client side
               return res.send({status:"ok",data:data});
            })

            .catch((err)=>{
                // returnig the error if the user is not found
                res.send({status:"error",data:err})
            })

    } catch (error) {
        res.send({status:"error",data:error})
    }
})

// api for triggering forgot password and generating link
app.post("/forgot-password", async (req,res)=>{
    const {email} = req.body ;
    
    try {
        const oldUser = await User.findOne({email});
        // checking if user with the email exist
        
        if (!oldUser) { 
            return res.json({status : "user not found"}); 
        }

        const secret = JWT_SECRET_KEY + oldUser.password
        const token =  jwt.sign(
            {email:oldUser.email, id:oldUser._id},
            secret, 
            {expiresIn:"5m"}
        )
        const link = `http://localhost:3000/reset-password?userId=${oldUser._id}&token=${token}`;

        // nodemailer
        // sends the link via email
        let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'boaserem022@gmail.com',
                    pass: 'zswdbrjuwhsqeiqo'
                }
            });//
          
          var mailOptions = {
            from: 'boaserem022@gmail.com',
            to: oldUser.email,
            subject: 'Password reset',
            text: "You will be redirected to a page where you will be able to reset your password",
            html :` <p>Click this  <a href=${link}>link</a> to reset your password </p> `
          };
          
          transporter.sendMail(mailOptions, (error, info)=>{
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
             return res.json({status:"sent", email:oldUser.email})
            }
          });


        // console.log(link);
        
    } catch (error) {
        
    }
})

// api for authenticating  token from link
app.post("/verify-link/:id/:token", async (req, res)=>{
    //recieve tokena and id from link sent to user
    const {id, token} = req.params;
   
    const oldUser = await User.findOne({_id:id});
    const secret = JWT_SECRET_KEY + oldUser.password
    // checking if user with the email exist
    if (!oldUser) { 
        return res.json({status : "user not found"}); 
    }
    else{
        try {
            const  verify = jwt.verify(token, secret);
            verify && res.send({status : "verified"})
        } catch (error) {
            res.send({status:"Not verified"})
        }
    }
    // return stastus of verified if it matches

})

// api for actually resetting the user password
app.post("/reset-password/:id/:token", async (req, res)=>{
    //recieve tokena and id from link sent to user
    const {id, token} = req.params; //from url
    const {password} = req.body; //from the body recieved from ui


    const oldUser = await User.findOne({_id:id});
    const secret = JWT_SECRET_KEY + oldUser.password
    // checking if user with the email exist

    if (!oldUser) { 
        return res.json({status : "user not found"}); 
    }

    try {

        // const  verify = jwt.verify(token, secret);
            const  verify = jwt.verify(token, secret);

        // encrypting the recieved password
        const encryptedPassword = await bcrypt.hash(password,10);

        //    updating the password in the User model
        verify && await User.updateOne(
            {_id:id} ,//what to update
            {$set:{password:encryptedPassword}} //who to update
        )

        res.json({status : "password updated"}); 
        
    }
    catch (error) {
        res.send("Not verified")
    }

})


require("./userSchema");

const User = mongoose.model("userInfo",userDetailsSchema )

app.listen(PORT,()=> console.log(`server started on port ${PORT}`));