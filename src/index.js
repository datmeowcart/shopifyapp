const functions = require('firebase-functions');
const express = require('express');
const crypto = require('crypto');

const axios = require('axios');

const app = express();

const SECRET = {
    app_id: '829084bb8940ff280009f1a3ad78e0f2',
    app_secret: 'b756128ae23ddd92edd9d41615e5d183',
    scope: 'read_products, write_products',
    redirect_url: 'http://127.0.0.1:5001/meowcart-app/asia-southeast1/academy/callback'
};

app.get('/', (req, res) => {
    const { shop } = req.query;
    if (!shop || (shop && shop === '')) {
        return res.send('Please enter shop name');
    }

    let shopifyDomain = shop;
    if (!shop.includes('.myshopify.com')) {
        shopifyDomain = shop + '.myshopify.com';
    }
    let nonce = crypto.randomBytes(16).toString('base64');

    let authorsize_url = `https://${shopifyDomain}/admin/oauth/authorize?client_id=${SECRET.app_id}&scope=${SECRET.scope}&redirect_uri=${SECRET.redirect_url}&state=${nonce}`;

    return res.send(authorsize_url);
});

app.get('/callback', async (req, res) => {
    const { shop, code } = req.query;
    let url = `https://${shop}/admin/oauth/access_token?client_id=${SECRET.app_id}&client_secret=${SECRET.app_secret}&code=${code}`

    try {
        const response = await axios.post(url);
        console.log(response.data);

    } catch (error) {
        console.log(error);
    }
    return res.send(req.query)
});

// app.get('/test', async (req, res) => {
//     const { token } = req.query;
//     let url = `https://appDat.myshopify.com`;
//     const response = await axios.get(url + '/admin/api/2024-04/shop.json', {
//         headers: {
//             'X-shopify-Access-Token': token,
//         },

//     });
//     return res.send(response.data);
// });

exports.academy = functions.region('asia-southeast1').https.onRequest(app);