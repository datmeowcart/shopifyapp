const functions = require('firebase-functions');
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const meowlog = require('@meowapp/meowlog');
const axios = require('axios');
const ShopifyService = require('./services/ShopifyService');

// const { request } = require('http');

const app = express();

const SECRET = {
    app_id: '829084bb8940ff280009f1a3ad78e0f2',
    app_secret: 'b756128ae23ddd92edd9d41615e5d183',
    scope: 'read_products, write_products, read_orders, write_orders',
    redirect_url: 'http://127.0.0.1:5000/api/callback',
};

app.get('/api', (req, res) => {
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

app.get('/api/callback', async (req, res) => {
    const { shop, code } = req.query;
    let url = `https://${shop}/admin/oauth/access_token?client_id=${SECRET.app_id}&client_secret=${SECRET.app_secret}&code=${code}`;
    const response = await axios.post(url);
    console.log(response.data);
    //saveFile(response.data);
    return res.send(req.query)
});

const saveFile = (access_token) => {
    const filePath = 'save.txt';
    const jsonData = JSON.stringify(access_token, null, 2);
    fs.writeFileSync(filePath, jsonData);
};

app.get('/api/test', async (req, res) => {
    const { token } = req.query;
    let url = `https://000undefined-clone.myshopify.com`;
    const response = await axios.get(url + '/admin/api/2024-04/shop.json', {
        headers: {
            'X-Shopify-Access-Token': token,
        },
    });
    return res.send(response.data);
});

app.post('/api/shopify/webhooks', async (req, res) => {
    meowlog('req', req.headers);
    meowlog('body', req.body);

    return res.send('Please check in terminal');
});

app.get('/api/createSubscriptions', async (req, res) => {
    const accessToken = 'shpua_08e2a48a809eaa91e246bf4d8561d3f2';
    const shop = '000undefined-clone.myshopify.com';
    const url = `https://${shop}/admin/api/2024-04/graphql.json`;

    const callbackUrl = `https://c945-2402-800-631c-f612-dd69-a45f-e0c-8181.ngrok-free.app/api/shopify/webhooks`;

    const WEBHOOK_SUBCRIPTION_QUERY = `#graphql
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        userErrors {
          field
          message
        }
        webhookSubscription {
          id
          topic
          format
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
      }
  }`;

    const variables = {
        topic: 'ORDERS_CREATE',
        webhookSubscription: {
            callbackUrl: callbackUrl,
            format: 'JSON',
        },
    }

    try {
        await ShopifyService.deleteWebhooks(shop, accessToken);
        // return res.send('Please check in terminal');
        const response = await axios.post(url, JSON.stringify({
            query: WEBHOOK_SUBCRIPTION_QUERY,
            variables,
        }),
            {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
            }
        )
            .then((res) => res.data);

        meowlog('createSubcriptionResponse', response);
        return res.send('Please check in terminal');
    } catch (error) {
        console.log('api.createSubscriptions ->error', error);
        return res.send(
            error instanceof Error ? error.message : "Internal server error"
        );
    }
});

exports.academy = functions.region('asia-southeast1').https.onRequest(app);