const axios = require('axios');

const initializeFunding =async (email, amount)=>{
    // Initializing funding for the wallets
    return axios({
        method: 'post',
        url: `${process.env.INITIALIZE_FUNDING}`,
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
        url: `${process.env.VERIFY_FUNDING}${reference}`,
        headers: {
            Authorization: `Bearer ${process.env.TEST_SECRET}`
        }
    })
}

const listTransactions = async()=>{
    return axios({
        method: 'get',
        url: `${process.env.LIST_TRANSACTION}`,
        headers:{
            Authorization: `Bearer ${process.env.TEST_SECRET}`
        }
    })
}


module.exports = {initializeFunding, verifyFunding, listTransactions}