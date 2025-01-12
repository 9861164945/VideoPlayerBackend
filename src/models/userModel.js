import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
const userSchema=mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true//makes user Searchable while db searching
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
           },
        
           fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
           },
           
           avatar:{
            type:String,//Cloudnary services
            required:true,
           
           },
           coverImage:{
            type:String,//Cloudnary services 
           },
           watchHistory:[
          {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"

           }
        ],
        password:{
            type:String,
            required:[true,"password id required"]
        },
        refreshToken:{
            type:String
        }
            
    }
    ,{timestamps:true});
    userSchema.pre("Save", async function(next)
    {
        if(!this.isModified("password")) return next();
         this.password=bcrypt.hash(this,password,10);
         next();
    });
    userSchema.methods.isPasswordCorrect=async function
    (password){
       return await bcrypt.compare(password,this.password);
    };
    userSchema.methods.generateAccessToken=function(){
        return jwt.sign(
            {//payload:dbname
                _id:this._id,
                email:this.email,
                username:this.username,
                fullname:this.fullname

            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRY
            });
    };
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