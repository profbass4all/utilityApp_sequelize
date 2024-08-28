const {listTransactionsFunction, transaction, allTransactions} = require('../controllers/transactions_controllers')
const express = require('express')
const router = express.Router()
const authorization = require('../middlewares/authorization')
const authentication = require('../middlewares/authentication');


router.get('/alltransactions', authentication, authorization(['admin']), listTransactionsFunction)

router.get('/transaction/:transaction_id', authentication, authorization(['admin', 'customer']), transaction)

router.get('/transaction', authentication, authorization(['admin', 'customer']), allTransactions)


module.exports = router;