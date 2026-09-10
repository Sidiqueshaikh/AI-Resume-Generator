import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({message:'unauthorized'})
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({message:'unauthorized'})
    }

}

export default protect;