const {initializeFunding, verifyFunding} = require('../services/paystack');
const sequelize= require('../config/sequelize')
const Transaction = require('../models/transaction_models')
const MINIMUM_FUNDABLE = 1000
const Wallet = require('../models/wallet_models');
const Redis = require('redis')
const redis_client = Redis.createClient()
const KOBO = 100


// Function to initialize funding of wallet
const fundWallet =async (req, res)=>{

    try {
        const {email, amount, wallet_id, description} = req.body;

        // Validate the email and amount
        //the user should have created a wallet with this email address
        const findWallet = await Wallet.findOne({where:{email: email, wallet_id: wallet_id}});
        if(!findWallet) throw new Error('Create a wallet first!!!');
        // console.log('wallet_id', findWallet.wallet_id)

        //check if amount is above or equal to 1000 Naira
        if(amount < MINIMUM_FUNDABLE) throw new Error('Amount must be at least 1000 Naira');

        // Call the initializeFunding function to fund the wallet
        const initializeFundingResponse = await initializeFunding(email, amount)

        //create a new transaction
        const newTransaction = await Transaction.create({
            user_id: findWallet.userId,
            email: email,
            description, //description
            wallet_id : findWallet.wallet_id,
            transaction_type: 'funding_wallet',
            amount: amount,
            transaction_status: 'pending',
        })
        
        //ensuring redis is available
        if(!redis_client.isOpen){
            await redis_client.connect()
        }

        //saving transaction_id and wallet_id to redis
        await redis_client.set('wallet_id',  JSON.stringify(findWallet.wallet_id))

        await redis_client.set('transaction_id', JSON.stringify(newTransaction.transaction_id))

        res.status(200).json({
            message: 'Funding successful!!!',
            status:'success',
            stats: initializeFundingResponse.data.status,
            authorization_url: initializeFundingResponse.data.data.authorization_url,
            reference: initializeFundingResponse.data.data.reference,
        })


    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
}

//function to verify funding
const fundWalletVerify = async (req, res) => {
    const t = await sequelize.transaction()

    try {

        const {reference} = req.params

        if(!reference) throw new Error (`invalid payment reference`)
        
        //ensuring redis is available
        if(!redis_client.isOpen){
            await redis_client.connect()
        }

        //get transaction and wallet id from redis
        let transaction_id = await redis_client.get('transaction_id')
        let wallet_id = await redis_client.get('wallet_id')

        //throw error if transaction_id and wallet_id are not found
        if(!transaction_id ||!wallet_id) throw new Error('An error occurred while connecting')
        
        const verifyFundingResponse = await verifyFunding(reference)

        //throw an error if the transaction is not successfully verified
        if(verifyFundingResponse.data.status == false) {
            await Transaction.update(
                {transaction_status: 'failed'},
                {
                    where:{email: req.user.email, transaction_id: JSON.parse(transaction_id)}
                }
            )
            throw new Error (verifyFundingResponse.data.message)
        }

        //if payment is successful update wallet balance accordingly
        const getWallet = await Wallet.findOne({where:{email: req.user.email, wallet_id:JSON.parse(wallet_id)}})
        if(!getWallet) throw new Error('An error occurred')
            
        //check if transaction reference is already in transaction db
        const findReference = await Transaction.findOne({where:{transaction_reference: verifyFundingResponse.data.data.reference}})
        
        //throw error if reference is already in transaction db (meaning the payment has been successfull in a previous transaction)
        if(findReference != null) throw new Error ('Payment has been successfull in a previous transaction')
        
        //start transaction
        
                //update the amount in the wallet
                await Wallet.update(
                        {amount: parseFloat(getWallet.amount) + (parseFloat(verifyFundingResponse.data.data.amount)/KOBO)},
                        {
                            where:{email: getWallet.email, wallet_id: getWallet.wallet_id},
                            transaction: t,
                        },
                
                    );
                
                //update the transaction properties
            await Transaction.update(
            {
                transaction_status:'completed',
                transaction_id: verifyFundingResponse.data.data.id, 
                transaction_reference: verifyFundingResponse.data.data.reference,
                transaction_paid_at: verifyFundingResponse.data.data.paid_at,
                transaction_gateway_response: verifyFundingResponse.data.data.gateway_response,
                transaction_channel: verifyFundingResponse.data.data.channel,
                transaction_ip_address: verifyFundingResponse.data.data.ip_address,
                amount: ( parseFloat(verifyFundingResponse.data.data.amount)/ KOBO),
                currency: verifyFundingResponse.data.data.currency
            },
            {
                where:{email: req.user.email, transaction_id:   JSON.parse(transaction_id)},
                transaction: t,
            },
             
        );

            //delete redis keys
        await redis_client.del('transaction_id')
        await redis_client.del('wallet_id')

        await t.commit();
        //return success message and transaction data
        return  res.status(200).json({
            message: 'Funding successful and transaction updated successfully',
            status:'success',
            data: verifyFundingResponse.data.data,
        })
} catch (error) {
    //if any error occurs rollback the transaction
        await t.rollback()
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
}

//function to get all wallets
const wallets = async (req, res) => {
    try {
        const getWallets = await Wallet.findAll({where: {email: req.user.email}})

        //if no wallets were found throw an error
        if(!getWallets) throw new Error('No wallets found')

        res.status(200).json({
            message: 'Wallets retrieved successfully',
            status:'success',
            data: getWallets
        })

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
}


module.exports = {fundWallet, fundWalletVerify, wallets};