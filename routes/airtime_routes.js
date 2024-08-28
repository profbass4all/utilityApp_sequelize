const {getSecretTokenAirtimeFunc, detectAirtimeOperatorFunc, sendTopUpFunc, getStatusAirtimeFunc} = require('../controllers/purchase_airtime_controllers')
const express = require('express')
const router = express.Router()

const authentication = require('../middlewares/authentication');
const authorization = require('../middlewares/authorization');



router.post('/getSecretTokenAirtime',authentication, authorization(['admin']),  getSecretTokenAirtimeFunc)

router.get('/detectAirtimeOperator', detectAirtimeOperatorFunc)

router.post('/sendTopUp', sendTopUpFunc)

router.get('/getStatusAirtime/:transaction_reference',authentication, authorization(['admin']),getStatusAirtimeFunc)


module.exports = router