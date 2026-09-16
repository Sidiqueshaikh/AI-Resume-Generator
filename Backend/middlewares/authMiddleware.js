import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({message:'unauthorized'})
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        // Tokens are issued with an `id` claim in userController. Keep the
        // authenticated user id in the property consumed by all controllers.
        req.userId = decoded.id;
        if (!req.userId) {
            return res.status(401).json({message:'unauthorized'})
        }
        next();
    }catch(error){
        return res.status(401).json({message:'unauthorized'})
    }

}

export default protect;
