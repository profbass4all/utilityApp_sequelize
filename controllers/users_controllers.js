const {validateCustomer, validateUpdateCustomer} = require('../validations/customers_validation')
const User = require('../models/users_models')
const Otp = require('../models/otp_models')
const Wallet = require('../models/wallet_models')
const { Op } = require("sequelize");
const {hashPassword, generateOtp, comparePassword} = require('../utils')
const Redis = require('redis')
const redisClient = Redis.createClient()
const {sendEmail} = require('../services/email')
const EXPIRATION_TIME = 60 * 10 //ten minutes 
const jwt = require('jsonwebtoken')
const sequelize= require('../config/sequelize')



//function to create a new user
const createUser =async (req, res)=>{
    try {

        //destructuring the request object to get the user details
        const {firstName, lastName, email, city, nin, whatsapp_no, password, confirmedPassword} = req.body;

        //validate the user details
        const {error} = validateCustomer(req.body)

        //check for errors during validation
        if(error !== undefined) throw new Error (error.details[0].message)
        
        //hash the password and return the hash and salt
        const [hash, salt] =await hashPassword(password)
        req.hash = hash
        req.salt = salt

        //check if redis is available
        if(!redisClient.isOpen){
            await redisClient.connect()
        }

        //insert the req.body into the the redis table
        await redisClient.set("newUser", JSON.stringify({firstName, lastName, email, hash, salt, whatsapp_no, nin, city}))

        //create the otp code
        const otp_code = generateOtp()

        //insert the otp code into the otp table
        await redisClient.setEx('otp', EXPIRATION_TIME, JSON.stringify({email, otp_code, createdAt: Date.now()}))

        //send the otp code to users email address
        sendEmail(email, `verify your email with this otp code ${otp_code }`, 'Email verification')

        const getuser = await redisClient.get('newUser')
        const getotp = await redisClient.get('otp')

        res.status(201).json({
            message: 'User created successfully. Please verify your email',
            status: 'success',
            data: JSON.parse(getuser),
            otp_code: JSON.parse(getotp)
        
        })

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
    

    


}

//function to verify user
const verifyUser = async(req, res)=>{
    const t = await sequelize.transaction()
    try {
        const {email, otp_code} = req.body

        //check if redis is available
        if(!redisClient.isOpen){
            await redisClient.connect()
        }

        //get otp object from redis
        const userOtp = await redisClient.get('otp')

        //parse the userOtp object
        const parsedOtp = JSON.parse(userOtp)

        // console.log('parsedOtp',parsedOtp)
        //check if the parsedOtp object exists in the database
        if(parsedOtp === null) throw new Error('Invalid or Expired OTP!!')

            // console.log('parsedOtp',parsedOtp)
            // console.log('parsedemail',parsedOtp.email, 'email', email)
        //check if the email and otp_code match
        if(parsedOtp.email != email || parsedOtp.otp_code != otp_code){
            throw new Error('Invalid or Expired OTP!!')
        }

        //get user from redis
        const userObj = await redisClient.get('newUser')

        //parse user gotten from redis
        const parsedUser = JSON.parse(userObj)

        //check if parsedUser is null
        if(!parsedUser) throw new Error ("Invalid or Expired Otp")

        //check if the email or whatsapp_no already exists in the database
        const findUser = await User.
        findOne({
                where: {
                    [Op.or]: [{ email: email}, {whatsapp_no: parsedUser.whatsapp_no}],
                },
                });
        //if email or whatsapp_no exists, throw an error
        
        if(findUser != null) throw new Error ('A user with this email or whatsapp Number already exists')
            console.log('got here')

        //create the new user

        

        const newUser = await User.create({
            firstName: parsedUser.firstName,
            lastName: parsedUser.lastName,
            email: parsedUser.email,
            hash: parsedUser.hash,
            salt: parsedUser.salt,
            whatsapp_no: parsedUser.whatsapp_no,
            is_email_verified: true,
            nin: parsedUser.nin,
            city: parsedUser.city
        },
        {
            transaction: t
        }
        
    )
console.log(' and got here')
        
        //create user's wallet
        await newUser.createWallet({email: parsedUser.email}, {transaction: t})
        
        await t.commit()
        //send welcome email to the new user
        sendEmail(email, `Your email address has been verified`, 'Verification Success')

        //delete the user from redis
        await redisClient.del("newUser")
        
        //delete the otp from redis
        await redisClient.del('otp')

        //return the new user object
        res.status(201).json({
            message: 'User verified successfully',
            status:'success',
            data: newUser
        })
    } catch (error) {
        await t.rollback()

        res.status(500).json({
            message: error,
            status: 'failure'
        });
    }
}

//function to login user
const login = async (req, res) => {
    try{
        //get email and password from the request body
        const {email, password} = req.body;

        //check if email is valid
        const findUser =await User.findOne({where: {email: email}})

        //if user not found, throw an error
        if(!findUser) throw new Error('Invalid Email or Password')

        //check if password matches with the hashed password
        const hash =await comparePassword(password, findUser.salt)

        if(hash != findUser.hash) throw new Error("Invalid Email or Password")

        //generate a token for the user
        const token = jwt.sign({email: findUser.email}, process.env.JWT_SECRET, {expiresIn: '1h'})


        res.setHeader('accessToken', token)
 
        res.status(200).json({
            message: 'User logged in successfully',
            status:'success',
        })
        
}catch(error){
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
    


};

//function to update user profile

const updateProfile = async (req, res) => {
    try{
        //get email from the request object
        const {email} = req.user;

        //validate the properties to be updated
        const {error} = validateUpdateCustomer(req.body)

        //check for errors during validation
        if(error != undefined) throw new Error(error.details[0].message)

        //update the user profile
        const updated = await User.update(req.body, {where: {email: email}})

        if(!updated) throw new Error ('Update customer failed')

        res.status(200).json({
            message: 'User profile updated successfully',
            status:'success',
        })
        
}catch(error){
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
};



//exporting the functions
module.exports = {createUser, verifyUser, login, updateProfile}