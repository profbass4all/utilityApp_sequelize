const {getSecretTokenAirtimeFunc, detectAirtimeOperatorFunc, sendTopUpFuncWallet,sendTopUpFuncPayThroughPaystackA,  getStatusAirtimeFunc, sendTopUpFuncPayThroughPaystackB } = require('../controllers/purchase_airtime_controllers')
const express = require('express')
const router = express.Router()

const authentication = require('../middlewares/authentication');
const authorization = require('../middlewares/authorization');



router.post('/getSecretTokenAirtime',authentication, authorization(['admin']),  getSecretTokenAirtimeFunc)

router.get('/detectAirtimeOperator', detectAirtimeOperatorFunc)

router.post('/sendTopUp', authentication, authorization(['admin', 'customer']), sendTopUpFuncWallet)

router.get('/getStatusAirtime/:transaction_reference',authentication, authorization(['admin']),getStatusAirtimeFunc)

router.post('/sendTopUpFuncPayThroughPaystackA', sendTopUpFuncPayThroughPaystackA)

router.post('/sendTopUpFuncPayThroughPaystackB', sendTopUpFuncPayThroughPaystackB)


module.exports = router