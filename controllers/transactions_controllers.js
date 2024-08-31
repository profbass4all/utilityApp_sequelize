const {listTransactions} = require('../services/paystack')
const Transaction = require('../models/transaction_models')
const Redis = require('redis')
const messages = require('../messages')
const redis_client = Redis.createClient()
const EXPIRATION_TIMEOUT = 60

//this function list all transactions...it's authorised for only admins
const listTransactionsFunction = async function (req, res){
    try {
        const alltransactions = await listTransactions()
        if(alltransactions.data.data == null) throw new Error(messages.NO_TRANSACTION)
        // console.log('listTransactions', alltransactions)

        res.status(200).json({
        message: messages.TRANSACTION_RETRIEVED,
        status:'success',
        data: alltransactions.data.data
    })

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
}

const transaction = async (req, res) => {
    try{
        const {transaction_id} = req.params

        const transactionDetails = await Transaction.findOne({where: {transaction_id: transaction_id}})

        if(!transactionDetails) throw new Error (messages.NO_TRANSACTION)

        res.status(200).json({
            message: messages.TRANSACTION_RETRIEVED,
            status:'success',
            data: transactionDetails
        })

    }catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
}

const allTransactions = async (req, res) => {

        if(!redis_client.isOpen){
            await redis_client.connect()
        }

        const PAGE = req.query.page || 1

        const LIMIT = 2

        const OFFSET = (PAGE - 1) * LIMIT

    try {
        //get transaction details from redis
        const cachedTransactionDetails = await redis_client.get(`transactionDetails?page=${PAGE}&limit=${LIMIT}&offset=${OFFSET}`)
        
        if(cachedTransactionDetails){
            return res.status(200).json({
                message: messages.TRANSACTIONS_CACHED,
                status:'success',
                data: JSON.parse(cachedTransactionDetails)
            })
        }else{
            
            const transactionDetails =await Transaction.findAll({ 
            attributes: ['transaction_id', 'wallet_id', 'transaction_type', 'transaction_status', 'transaction_gateway_response', 'amount'],
            where:{ email: req.params.email},
            limit: LIMIT,
            offset: OFFSET
        })
        
        if(!transactionDetails) throw new Error(messages.NO_TRANSACTION)

        redis_client.setEx(`transactionDetails?page=${PAGE}&limit=${LIMIT}&offset=${OFFSET}`, EXPIRATION_TIMEOUT, JSON.stringify(transactionDetails) )
        
        

        res.status(200).json({
            message: messages.TRANSACTION_RETRIEVED,
            status:'success',
            data: transactionDetails
        
        })

    }
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        });
    }
}


module.exports = {listTransactionsFunction, transaction, allTransactions};