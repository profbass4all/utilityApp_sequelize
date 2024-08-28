const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

//call to api for secret access token
const getSecretTokenAirtime = async () => {
  return axios({
    method: 'post',
    url: 'https://auth.reloadly.com/oauth/token',
    data: {
      client_id: process.env.API_CLIENT_ID,
      client_secret: process.env.API_CLIENT_SECRET,
      grant_type: 'client_credentials',
      audience: 'https://topups-sandbox.reloadly.com'
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
};

//call api to detect operator 
const detectAirtimeOperator = async (phone, countryIsoCode ) => {

    const options = {
      method: 'GET',
      url: `https://topups-sandbox.reloadly.com/operators/auto-detect/phone/${phone}/countries/${countryIsoCode}`,
      params: {
      suggestedAmountsMap: 'true',
      suggestedAmounts: 'false'
    },
  headers: {
    'Accept': 'application/com.reloadly.topups-v1+json',
    'Authorization': `Bearer ${process.env.AIRTIME_SECRET_TOKEN}`,// access token gotten from the first ap call
    'Content-Type': 'application/json'
  }
};
    return axios(options);  

};

//api to buy the top up
const sendTopUp = async (operatorId, amount, email, countryCode, number) => {

  const options = {
              method: 'POST',
              url: 'https://topups-sandbox.reloadly.com/topups-async', 
              headers: {
                'Accept': 'application/com.reloadly.topups-v1+json',
                'Authorization': `Bearer ${process.env.AIRTIME_SECRET_TOKEN}`,
                'Content-Type': 'application/json'
              },
              
              data: {
                operatorId: operatorId,
                amount: amount,
                useLocalAmount: true,
                customIdentifier: uuidv4(),
                recipientEmail: email,
                recipientPhone: {
                  countryCode: countryCode,
                  number: `234${number}`
                },
                senderPhone: {
                  countryCode: 'CA',
                  number: '11231231231'
                }
              }
      }
        
      console.log(options.data.recipientPhone.number);

     return axios(options);
     
    
};

//get the status of an individual transaction
const getStatusAirtime = async (transactionId) => {
  const options = {
    method: 'GET',
    url: `https://topups-sandbox.reloadly.com/topups/${transactionId}/status`,
    headers: {
      'Accept': 'application/com.reloadly.topups-v1+json',
      'Authorization': `Bearer ${process.env.AIRTIME_SECRET_TOKEN}`
    }
  };

    return await axios(options);  
};


module.exports = {getSecretTokenAirtime, detectAirtimeOperator, sendTopUp, getStatusAirtime};
