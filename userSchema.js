const mongoose = require("mongoose");

userDetailsSchema = new mongoose.Schema(
    {
      fname:String,
      lname:String,
      email:{type:String, unique:true},
      password: String, 
    },
    {collection:"userInfo"}
)