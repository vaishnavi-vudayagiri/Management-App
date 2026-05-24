import jwt from "jsonwebtoken";

export const authMiddleware=(req,res,next)=>{
    try{
        const token=req.cookies.token;
        if(!token){
            return res.json({message:"LOGIN FIRST"});
            }
        

        //verify token
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        req.user=decoded;
        next();


    }catch(err){
        req.status(401).json({message:"invalid token"});
    }
};