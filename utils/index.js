const bcrypt = require('bcrypt');
const maxTime = 600000  //ten minutes


//this function is used to generate random otp
const generateOtp = ()=>{
    return Math.round((Math.random() + 1) * 100000)
}

//this function is used to hash the incoming password and return the hash and salt
const hashPassword = async(password) => {
     const saltRound = 10;  // Number of rounds for salt generation and hashing

     // Generate a salt and hash the password concurrently using a Promise.
    // The resolve() function returns the hashed password and the salt.
    return new Promise((resolve,  reject) => {
        bcrypt.genSalt(saltRound, (err, salt) => {     
            if(err) reject(err)
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) reject(err)
                resolve([hash, salt])
             })
        })
    })
   
}

//this function is used to compare the incoming password with the stored hashed password
const comparePassword = async(password, salt) => {
    return new Promise((resolve,  reject) => {
        
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) reject(err)
                resolve(hash)
             })
       
    })
   
}

//this function is used to check if the otp has expired by comparing the time it was created and the current time
const expiryTime = (otpTime)=>{

    // Get the current time in milliseconds since January 1, 1970.
    const currentTime = new Date().getTime()

    // Compare the current time with the time the OTP was created. If the difference is greater than the maximum time allowed (10 minutes), return true. Otherwise, return false. 10 minutes is represented as 60000000000000000 milliseconds (10 * 60 * 1000). 60000000000000000 is equivalent to
    if(currentTime - otpTime >maxTime ){
        return true
    }
    return false
} 

//export all the functions to be used in other files.
module.exports = {generateOtp, hashPassword, comparePassword, expiryTime}