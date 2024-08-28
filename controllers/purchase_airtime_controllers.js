const {getSecretTokenAirtime, detectAirtimeOperator, sendTopUp, getStatusAirtime} = require('../services/airtime');
const Transaction = require('../models/transaction_models')

//this function generate the secret token for buying airtime
const getSecretTokenAirtimeFunc =async (req, res)=>{
    
    try {
        
            //generate the secret token
        const response = await getSecretTokenAirtime()

        if(!response.data) throw new Error('An error occurred')
           
        res.status(200).json({
            message: 'Access token gotten successfully',
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

        if(!phone || !countryIsoCode || !email || !amount) throw new Error ("Invalid phone or iso code")

        //check the operator using the country code and phone number
        const response = await detectAirtimeOperator(phone, countryIsoCode)
        if(!response.data) throw new Error('An error occurred')

        //create a new transaction in the database
        const newTransaction = await Transaction.create({
            amount: amount,
            transaction_type: 'buy_airtime',
            transaction_status: 'pending',
            email: email,
        })
        
        //save all needed information in redis
        // await redis_client.set('transaction_id', newTransaction.transaction_id)
        // await redis_client.set('phone', phone)
        // await redis_client.set('countryIsoCode', countryIsoCode)
        // await redis_client.set('email', email)
        // await redis_client.set('amount', amount)
        // await redis_client.set('operatorId', response.data.operatorId)

        res.status(200).json({
            message: 'Airtime operator detected successfully',
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

//this function sends top up to custoers account
const sendTopUpFunc =async (req, res) => {

    try {
        const {transaction_id, number,countryCode, email, amount , operatorId} = req.body

        if(!operatorId ||!amount ||!email ||!countryCode ||!number) throw new Error ("Invalid parameters")

        //send the top-up to the operator
        const response = await sendTopUp(operatorId, amount, email, countryCode, number.slice(1))

        //check for errors
        if(!response.data)  throw new Error('An error occurred')
        
        //update the transaction status in the database
        await Transaction.update(
            {
            transaction_reference: response.data.transactionId,
            amount: amount,
            transaction_type: 'buy_airtime',
            transaction_status: 'completed',
            email: email,
        },
       {
        where:{email: email, transaction_id: transaction_id }
       }
    )
        res.status(200).json({
            message: 'Top-up successful',
            status:'success',
            data: response.data,
        })

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure',
            data: response
        })
    }
}

//this function get the status of the transaction

const getStatusAirtimeFunc =async (req, res)=>{
    try {
        const {transaction_reference} = req.params;

        if(!transaction_reference) throw new Error('transaction_reference not found')

        const response = await getStatusAirtime(transaction_reference)

        if(!response.data) throw new Error('An error occurred')
        
        res.status(200).json({
            message: 'Status retrieved successfully',
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



module.exports = {getSecretTokenAirtimeFunc, detectAirtimeOperatorFunc, sendTopUpFunc, getStatusAirtimeFunc}