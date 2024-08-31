const jwt = require('jsonwebtoken');
const User = require('../models/users_models')
const messages = require('../messages')

const authentication = (req, res, next)=>{

    try {
        //get the accessToken
        const accessToken = req.headers.authorization 
        //check if the accessToken exists
        if(!accessToken) throw new Error(messages.LOGIN_REQUIRED)

        //check if the accessToken is valid
        // const decode = jwt.verify(accessToken, process.env.JWT_SECRET)

        jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decoded)=>{
                //if the token is invalid, throw an error
                if (err) {
                    if(err instanceof jwt.JsonWebTokenError){
                    
                    return res.status(401).json({message: messages.INVALID_TOKEN})
                    
                }else if(err instanceof jwt.TokenExpiredError){
                    return res.status(401).json({message: messages.TOKEN_EXPIRED})
             
                }else{
                        res.status(500).json({message: err.message})
                    }
                }
                 //if the accessToken is valid, add the user to the request
                const email = decoded.email;
                
                const user =await User.findOne({where : {email: email}})

                req.params.user_id = user.id;
                req.params.user = user;
                req.params.email = email;
            
                next()

            });
    } catch (error) {
            res.status(500).json({
                message: error.message,
                status: 'error'
            })
    }
}

module.exports = authentication