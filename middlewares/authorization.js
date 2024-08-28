const User = require('../models/users_models')

const authorization =(role)=>{
    return async (req, res, next)=>{

        try {
            //get the email address from the req.user object
        const {email} = req.user

        //check if the user's email is valid
        if(!email) throw new Error( 'Invalid user!!' , 401)

        //find the user with the email address
        const user = await User.findOne({where:{email}})
                console.log('got here')

        //check if the user exists
        if(!user) throw new Error( 'User not found')

        //check if the user's role matches the required role
        if(!role.includes(user.role)) throw new Error( 'Unauthorised!!' , 403 )

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