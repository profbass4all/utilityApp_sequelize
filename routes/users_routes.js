const express = require('express');
const router = express.Router();
const authorization = require('../middlewares/authorization')
const authentication = require('../middlewares/authentication');
const {createUser, verifyUser, login, updateProfile} = require('../controllers/users_controllers')


router.post('/user', createUser)

router.post('/verify', verifyUser)

router.post('/login', login)

router.patch('/updateProfile', authentication, authorization(['admin', 'customer']), updateProfile)



module.exports= router 
