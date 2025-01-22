import  mongoose from 'mongoose';
 const subscriptionSchema=mongoose.Schema(
    {
        subscriper:
        {
            type:mongoose.Schema.Types.ObjectId,//One who is Subscribing
            ref:"User"

        },
        channel:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }

},timestamp:true);
export const SubScription=mongoose.model("SubScription",subscriptionSchema);