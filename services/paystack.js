const axios = require('axios');

const initializeFunding =async (email, amount)=>{
    // Initializing funding for the wallets
    return axios({
        method: 'post',
        url: 'https://api.paystack.co/transaction/initialize',
        headers: {
            Authorization: `Bearer ${process.env.TEST_SECRET}`,
            'Content-Type': 'application/json'
        },
        data: {
            amount: amount * 100, // amount in kobo
            email: email
        }
    })
}

const verifyFunding = async ( reference)=>{
    // Verifying the funding status
    return axios({
        method: 'get',
        url: `https://api.paystack.co/transaction/verify/${reference}`,
        headers: {
            Authorization: `Bearer ${process.env.TEST_SECRET}`
        }
    })
}

const listTransactions = async()=>{
    return axios({
        method: 'get',
        url:'https://api.paystack.co/transaction',
        headers:{
            Authorization: `Bearer ${process.env.TEST_SECRET}`
        }
    })
}
module.exports = {initializeFunding, verifyFunding, listTransactions}