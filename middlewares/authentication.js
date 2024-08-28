const jwt = require('jsonwebtoken');

const authentication = (req, res, next)=>{

    try {
        //get the accessToken
        const accessToken = req.headers.authorization 
        //check if the accessToken exists
        if(!accessToken) throw new Error('Login is required')

        //check if the accessToken is valid
        // const decode = jwt.verify(accessToken, process.env.JWT_SECRET)

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded)=>{
                //if the token is invalid, throw an error
                if (err) {
                    throw new Error( err)
                }
                 //if the accessToken is valid, add the user to the request
                req.user = decoded
            
            });
    
        next()

    } catch (error) {
            if(error instanceof jwt.JsonWebTokenError){
                    
                return res.status(401).json({message: 'Invalid token!!'})
                    
                }else if(error instanceof jwt.TokenExpiredError){
                    return res.status(401).json({message: 'Token expired'})
             
                }else{
                        res.status(500).json({message: error.message})
                    }
    }
}

module.exports = authentication