import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=mongoose.Schema(
    {
videoFile:{
    type:String,//cloudnary url
    required:[true,"Video File Needed"],

},
thumbnail:{
    type:String,//cloudnary url
    required:[true,"Thumbnail is required"],
    
},
title:{
    type:String,
    required:[true,"Title is required"],
    
},
description:{
    type:String,
    required:[true,"Descrption is required"],
    
},
duration:{
    type:Number,
    required:[true,"Duration is required"],
    
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
    type:mongoose.Schema.Types.ObjectId,//reference from user
    ref:"User"
}
    }
    ,{timestamp:true});
    videoSchema.plugin(mongooseAggregatePaginate);//using these we can write aggregate query
export const Video=mongoose.model("Video",videoSchema);