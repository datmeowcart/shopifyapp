const functions = require('firebase-functions');
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');

const axios = require('axios');
// const { request } = require('http');

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
        saveFile(response.data);

    } catch (error) {
        console.log(error);
    }
    return res.send(req.query)
});

const saveFile = (access_token) => {
    const filePath = 'save.txt';
    const jsonData = JSON.stringify(access_token, null, 2);
    fs.writeFileSync(filePath, jsonData);
};



exports.academy = functions.region('asia-southeast1').https.onRequest(app);