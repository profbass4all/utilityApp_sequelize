const messages = require('../messages')
const User = require('../models/users_models')

const authorization =(role)=>{
    return async (req, res, next)=>{

        try {
            //get the email address from the req.params object
        const {user_id} = req.params

        //check if the user's email is valid
        if(!user_id) throw new Error( messages.ERROR_OCCURED , 401)

        //find the user with the email address
        const user = await User.findOne({where:{id : user_id}})

        //check if the user exists
        if(!user) throw new Error(messages.INVALID_USER , 401)

        //check if the user's role matches the required role
        if(!role.includes(user.role)) throw new Error( messages.UNAUTHORIZED , 403 )

        next()
        } catch (error) {
            res.status(500).json({
                message: error.message,
                status: 'error'
 
            })
        }


    }
}

module.exports = authorization;