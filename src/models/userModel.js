import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
const userSchema=mongoose.Schema(
    {
        username:
        {
            type:String,
            required:[true,"username is required"],
            unique:true,
            lowercase:true,
            trim:true,
            index:true//makes user Searchable while db searching ordering user like  array index
        },
        email:
        {
            type:String,
            required:[true,"user email is a required field"],
            unique:true,
            lowercase:true,
            trim:true,
           },
        
           fullname: 
           {
            type:String,
            required:[true,"full name is required"],
            trim:true,
            index:true
           },
           
           avatar:
           {
            type:String,//Cloudnary services
            required:true,
           
           },
           coverImage:{
            type:String,//Cloudnary services 
           },
           watchHistory:[
          {
            type:mongoose.Schema.Types.ObjectId,//Reference From Video db
            ref:"Video"

           }
        ],
        password: 
        {
            type:String,
            required:[true,"password id required"]
        },
        refreshToken:{
            type:String
        }
            
    }
    ,{timestamps:true});
    userSchema.pre("Save", async function(next)//.pre means before storing data in database
    {
        if(!this.isModified("password")) return next();
         this.password=await bcrypt.hash(this,password,10);//password length  must be 10 
         next();
    });
    userSchema.methods.isPasswordCorrect=async function
    (password){
       return await bcrypt.compare(password,this.password);// bcrypt.compare () means which password is  pass by the function parameter that compare with  the password which is avaliable in the database
    };
    //Access Token
    userSchema.methods.generateAccessToken=function(){
        return jwt.sign(
            {//payload:dbname
                _id:this._id,
                email:this.email,
                username:this.username,
                fullname:this.fullname

            },
            process.env.ACCESS_TOKEN_SECRET,//Acess token which is avaliable inside .env
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRY//access token is expired in this days after the end of the expiry days a new awt token generated
            });
    };
    //Refresh Token
    userSchema.methods.generateRefreshToken=function(){
        return jwt.sign(
            {//payload:dbname
                _id:this._id,
                

            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            });
    

    };
    
 export const User=mongoose.model("User",userSchema);