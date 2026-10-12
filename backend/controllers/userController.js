import User from "../models/UserSchema.js"

export const getCurrentUser=async(req,res)=>{
    try{
        const userId=req.auth.payload.sub
        const user = await User.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, plan: "Free-tier" } },
    //   only sets if it is a new user
      {
        upsert: true,
        // upsert is for if the record is not created it will create 
        // a new record 
        returnDocument: "after",
        // return the document after the update 
        runValidators: true,
        // run validators is for if any other tiers are given 
        // except the advances , free-tier , plus it will 
        // give an error 
      }
    );

    return res.json({ plan: user.plan });

    }
    catch(err){
        console.log(err)
    }

}