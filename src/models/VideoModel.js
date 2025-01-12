import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=mongoose.Schema(
    {
videoFile:{
    type:String,//cloudnary url
    required:true,

},
thumbnail:{
    type:String,//cloudnary url
    required:true,
    
},
title:{
    type:String,
    required:true,
    
},
description:{
    type:String,
    required:true,
    
},
duration:{
    type:Number,
    required:true,
    
},
  
views:{
    type:Number,
default:0    
},
isPublished:{
    type:Boolean,
    default:true,
},
videoUploader:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
}
    }
    ,{timestamp:true});
    videoSchema.plugin(mongooseAggregatePaginate);//using these we can write aggregate query
export const Video=mongoose.model("Video",videoSchema);