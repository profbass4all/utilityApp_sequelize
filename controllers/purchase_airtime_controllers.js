const {getSecretTokenAirtime, detectAirtimeOperator, sendTopUp, getStatusAirtime} = require('../services/airtime');
const Transaction = require('../models/transaction_models');
const Wallet = require('../models/wallet_models');
const sequelize = require('../config/sequelize');
const {initializeFunding, verifyFunding} = require('../services/paystack')
const KOBO = 100
const messages = require('../messages');

//this function generate the secret token for buying airtime
const getSecretTokenAirtimeFunc =async (req, res)=>{
    
    try {
        
            //generate the secret token
        const response = await getSecretTokenAirtime()

        if(!response.data) throw new Error(messages.ERROR_OCCURED)
           
        res.status(200).json({
            message: messages.ACCESS_TOKEN,
            status:'success',
            data: response.data,
        })
    }catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
}

//this function automatically detect the operator of the phone number e.g. MTN or GLO
const detectAirtimeOperatorFunc = async (req, res) => {
     try {
 
        const {phone, countryIsoCode, email, amount} = req.body

        if(!phone || !countryIsoCode || !email || !amount) throw new Error (messages.INVALID_PARAMETERS)

        //check the operator using the country code and phone number
        const response = await detectAirtimeOperator(phone, countryIsoCode)
        if(!response.data) throw new Error(messages.ERROR_OCCURED)

        //create a new transaction in the database
        //i am just trying to use a different flow here
        const newTransaction = await Transaction.create({
            amount: amount,
            transaction_type: 'buy_airtime',
            transaction_status: 'pending',
            email: email,
        })
        

        res.status(200).json({
            message: messages.AIRTIME_OPERATOR,
            status:'success',
            data: response.data,
            transaction_id:newTransaction.transaction_id
        })

     } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
     }
}

//this function sends top up to custoers account when paying through wallet
const sendTopUpFuncWallet =async (req, res) => {

    const t = await sequelize.transaction()

    try {

        const {transaction_id, number,countryCode, email, amount , operatorId} = req.body

        if(!operatorId ||!amount ||!email ||!countryCode ||!number) throw new Error (messages.INVALID_PARAMETERS)

        const checkScam = await Transaction.findOne({where: {transaction_id: transaction_id, transaction_status: 'completed'}})
        if(checkScam != null) throw new Error (messages.TRY_AGAIN)
        
        //get the user's wallet
        const userWallet = await Wallet.findOne({where:{userId: req.params.user_id}})

        if(!userWallet) throw new Error(messages.WALLET_NOT_FOUND)

        if(parseFloat(userWallet.amount) < parseFloat(amount)) throw new Error (messages.INSUFFICIENT_FUNDS)
            
        await Wallet.update({amount: parseFloat(userWallet.amount) - parseFloat(amount)},
            {where:
                {
                userId: req.params.user_id,
            },
            transaction: t
        })
            // console.log('Updated use)
            //update the transaction status in the database
        await Transaction.update(
            {
            amount: amount,
            transaction_type: 'buy_airtime',
            transaction_status: 'completed',
            email: email,
            },
            {
                where:{email: email, transaction_id: transaction_id },
                transaction: t
        })

        await t.commit()

         //send the top-up to the customer
        const response = await sendTopUp(operatorId, amount, email, countryCode, number.slice(1))

        //check for errors
        if(!response.data)  throw new Error('An error occurred')
        
        await Transaction.update({transaction_reference: response.data.transactionId}, 
            {
                where: {email: email, transaction_id: transaction_id },
            }
        )

        res.status(200).json({
            message: messages.TOP_UP_SUCCESS,
            status:'success',
            data: response.data,
        })   
    } catch (error) {

        await t.rollback()
        
        res.status(500).json({
            message: error.message,
            status: 'failure',
        })
    }
}

const sendTopUpFuncPayThroughPaystackA = async(req, res)=>{
    try {
        //implement this function to send the top-up to the customer using paystack
        const {email, amount} = req.body

        if(!amount ||!email) throw new Error (messages.INVALID_PARAMETERS)

        // Call the initializeFunding function to fund the wallet
        const initializeFundingResponse = await initializeFunding(email, amount)

        res.status(200).json({
            message: messages.FUNDING_SUCCESS,
            status:'success',
            data: {
                stats: initializeFundingResponse.data.status,
                authorization_url: initializeFundingResponse.data.data.authorization_url,
                reference: initializeFundingResponse.data.data.reference,
            }
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        });
    }
}

const sendTopUpFuncPayThroughPaystackB = async(req, res)=>{
    try {
        
        const {reference, email, transaction_id, operatorId, amount, countryCode, number } = req.body

        if(!reference) throw new Error ( messages.INVALID_REF)

         //check if transaction reference is already in transaction db
        const findReference = await Transaction.findOne({where:{transaction_reference: reference, transaction_gateway_response: "Approved"}})
        if(findReference != null) throw new Error (messages.TRY_AGAIN);
        
        const verifyFundingResponse = await verifyFunding(reference)
        if(verifyFundingResponse.data.data.status != 'success') throw new Error(messages.ERROR_OCCURED);
        
        //send the top-up to the customer
        const response = await sendTopUp(operatorId, amount, email, countryCode, number.slice(1))

        //check for errors
        if(!response.data)  throw new Error(messages.ERROR_OCCURED)

        const updateTransaction = await Transaction.update(
            {
            transaction_paid_at: verifyFundingResponse.data.data.paid_at,
            transaction_gateway_response: verifyFundingResponse.data.data.gateway_response,
            transaction_channel: verifyFundingResponse.data.data.channel,
            transaction_ip_address: verifyFundingResponse.data.data.ip_address,
            amount: ( parseFloat(verifyFundingResponse.data.data.amount)/ KOBO),
            transaction_type: 'buy_airtime',
            transaction_status: 'completed',
            email: email,
            transaction_id: response.data.transactionId,
            transaction_reference: reference
            },
            {
                where:{email: email, transaction_id: transaction_id },
        })

        // console.log('obj', updateTransaction)
        if(updateTransaction[0] != 1) throw new Error('An error occurred while updating the database transaction')

        res.status(200).json({
            message: messages.TOP_UP_SUCCESS,
            status:'success',
            data: response.data,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        });
    }
}
//this function get the status of the transaction
const getStatusAirtimeFunc =async (req, res)=>{
    try {
        const {transaction_reference} = req.params;

        if(!transaction_reference) throw new Error(messages.INVALID_REF)

        const response = await getStatusAirtime(transaction_reference)

        if(!response.data) throw new Error(messages.ERROR_OCCURED)
        
        res.status(200).json({
            message: messages.AIRTIME_STATUS,
            status:'success',
            data: response.data,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
}



module.exports = {
    getSecretTokenAirtimeFunc, 
    detectAirtimeOperatorFunc, 
    sendTopUpFuncWallet, 
    getStatusAirtimeFunc,
    sendTopUpFuncPayThroughPaystackA,
    sendTopUpFuncPayThroughPaystackB
}