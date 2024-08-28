const express = require('express');
const router = express.Router();
const {fundWallet, fundWalletVerify, wallets} = require('../controllers/wallet_controller')
const authorization = require('../middlewares/authorization')
const authentication = require('../middlewares/authentication');
const buyAirtime = require('../controllers/purchase_airtime_controllers')



router.post('/fundWallet', authentication, authorization(['admin', 'customer']), fundWallet)

router.get('/verifyfundWallet/:reference', authentication, authorization(['admin', 'customer']), fundWalletVerify)

router.get('/wallets', authentication, authorization(['admin', 'customer']), wallets)


module.exports = router;


