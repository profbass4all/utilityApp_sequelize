const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

//call to api for secret access token
const getSecretTokenAirtime = async () => {
  return axios({
    method: 'post',
    url: process.env.GET_SECRET_TOKEN,
    data: {
      client_id: process.env.API_CLIENT_ID,
      client_secret: process.env.API_CLIENT_SECRET,
      grant_type: 'client_credentials',
      audience: process.env.AUDIENCE
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
      url: `${process.env.DETECT_AIRTIME_OPERATOR}${phone}/countries/${countryIsoCode}`,
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
              url: process.env.SEND_TOP_UP_URL, 
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
                  number: process.env.SENDER_PHONE
                }
              }
      }
        
      // console.log(options.data.recipientPhone.number);

     return axios(options);
     
    
};

//get the status of an individual transaction
const getStatusAirtime = async (transactionId) => {
  const options = {
    method: 'GET',
    url: `process.env.GET_STATUS_OF_AIRTIME${transactionId}/status`,
    headers: {
      'Accept': 'application/com.reloadly.topups-v1+json',
      'Authorization': `Bearer ${process.env.AIRTIME_SECRET_TOKEN}`
    }
  };

    return await axios(options);  
};


module.exports = {getSecretTokenAirtime, detectAirtimeOperator, sendTopUp, getStatusAirtime};
