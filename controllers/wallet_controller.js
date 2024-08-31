const {initializeFunding, verifyFunding} = require('../services/paystack');
const sequelize= require('../config/sequelize')
const Transaction = require('../models/transaction_models');
const MINIMUM_FUNDABLE = 1000
const KOBO = 100
const messages = require('../messages')


// Function to initialize funding of wallet
const fundWallet =async (req, res)=>{

    try {
        const {user} = req.params

        const {email, amount} = req.body;

        const wallet = user.getWallet()
        //the user should have created a wallet with this email address
        // const findWallet = await Wallet.findOne({where:{userId: user_id}});
        if(!wallet) throw new Error(messages.WALLET_NOT_FOUND);
        // console.log('wallet_id', findWallet.wallet_id)

        //check if amount is above or equal to 1000 Naira
        if(amount < MINIMUM_FUNDABLE) throw new Error(messages.MIN_AMOUNT);

        // Call the initializeFunding function to fund the wallet
        const initializeFundingResponse = await initializeFunding(email, amount)

        //create a new transaction
        //transaction shoudn't be created bacause some werey will just be hitting this endpoint and will be populating my db with useless data.
        // const newTransaction = await Transaction.create({
        //     user_id: findWallet.userId,
        //     email: email,
        //     description, //description
        //     wallet_id : findWallet.wallet_id,
        //     transaction_type: 'funding_wallet',
        //     amount: amount,
        //     transaction_status: 'pending',
        // })
        

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
        })
    }
}

//function to verify funding
const fundWalletVerify = async (req, res) => {

    //start a transaction
    const t = await sequelize.transaction()

    try {

        const {reference, user, email} = req.params

        if(!reference) throw new Error (messages.INVALID_REF)

         //check if transaction reference is already in transaction db
        const findReference = await Transaction.findOne({where:{transaction_reference: reference, transaction_gateway_response: "Approved"}})
        if(findReference != null) throw new Error (messages.PAYMENT_FAILED);
        
        const verifyFundingResponse = await verifyFunding(reference)
        if(verifyFundingResponse.data.data.status != 'success') throw new Error(messages.PAYMENT_FAILED);

        // //throw an error if the transaction is not successfully verified

        // if(verifyFundingResponse.data.status == false) {
        //     await Transaction.update(
        //         {transaction_status: 'failed'},
        //         {
        //             where:{email: req.user.email, transaction_id: JSON.parse(transaction_id)}
        //         }
        //     )
        //     throw new Error (verifyFundingResponse.data.message)
        // }

        //if payment is successful get the user's wallet

        const getUserWallet = await user.getWallet({transaction: t})
        if(!getUserWallet) throw new Error(messages.ERROR_OCCURED)
        
                //update the amount in the wallet
        
        getUserWallet.amount = parseFloat(getUserWallet.amount) + (parseFloat(verifyFundingResponse.data.data.amount)/KOBO)
        
        await getUserWallet.save({transaction: t})
                
         //create the transaction properties
            await Transaction.create(
            {
                transaction_status:'completed',
                transaction_id: verifyFundingResponse.data.data.id,
                wallet_id: getUserWallet.wallet_id, 
                transaction_reference: verifyFundingResponse.data.data.reference,
                transaction_paid_at: verifyFundingResponse.data.data.paid_at,
                transaction_gateway_response: verifyFundingResponse.data.data.gateway_response,
                transaction_channel: verifyFundingResponse.data.data.channel,
                transaction_ip_address: verifyFundingResponse.data.data.ip_address,
                amount: ( parseFloat(verifyFundingResponse.data.data.amount)/ KOBO),
                currency: verifyFundingResponse.data.data.currency,
                transaction_type: 'funding_wallet',
                email: email
            },
            {
                transaction: t,
            },
             
        );

        await t.commit();
        //return success message and transaction data
        return  res.status(200).json({
            message: messages.WALLET_UPDATED,
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
        const {user} = req.params
        const getUserWallet = await user.getWallet()

        //if no wallets were found throw an error
        if(!getUserWallet) throw new Error(messages.WALLET_NOT_FOUND)

        const getTransactions = await Transaction.findAll({where: {email: req.params.email}})
        if(!getTransactions) throw new Error(messages.ERROR_OCCURED)

        res.status(200).json({
            message: messages.WALLET_RETRIEVED,
            status:'success',
            wallet: getUserWallet,
            transaction: getTransactions
        })

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 'failure'
        })
    }
}


module.exports = {fundWallet, fundWalletVerify, wallets};