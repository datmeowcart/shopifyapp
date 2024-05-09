const axios = require('axios');
const meowlog = require('@meowapp/meowlog');

class ShopifyService {
  static async deleteWebhooks(
    shopifyDomain,
    accessToken,
    apiVersion = '2024-04'
  ) {
    const apiUrl = this.createGraphQLUrl(shopifyDomain, apiVersion);
    const WEBHOOKS_GET_QUERY = `#graphql
        query {
            webhookSubscriptions(first: 10) {
              edges {
                node {
                  id
                  topic
                  endpoint {
                    __typename
                    ... on WebhookHttpEndpoint {
                      callbackUrl
                    }
                    ... on WebhookEventBridgeEndpoint {
                      arn
                    }
                    ... on WebhookPubSubEndpoint {
                      pubSubProject
                      pubSubTopic
                    }
                  }
                }
              }
            }
          }
        `;
    const response = await axios.post(
      apiUrl,
      JSON.stringify({
        query: WEBHOOKS_GET_QUERY,
      }),
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    ).then((res) => res.data);

    const isHasData = response?.data?.webhookSubscriptions?.edges.length > 0;
    if (!isHasData) {
      return true;
    }

    for (const node of response.data.webhookSubscriptions.edges) {
      console.log('DELETING WEBHOOK:', node.node.id, node.node.topid)
      await this.deleteWebhook(shopifyDomain, accessToken, apiVersion, node.node.id)
    }

    meowlog('response', response);

    return false;
  }

  static deleteWebhook(shopifyDomain, accessToken, apiVersion = '2024-04', webhookId) {
    const apiUrl = this.createGraphQLUrl(shopifyDomain, apiVersion);
    const WEBHOOK_DELETE_QUERY = `#graphql
    mutation webhookSubscriptionDelete($id: ID!) {
      webhookSubscriptionDelete(id: $id) {
        userErrors {
          field
          message
        }
        deletedWebhookSubscriptionId
      }
    }
    `;

    const variables = {
      id: webhookId,
    };

    return axios.post(apiUrl, JSON.stringify({
      query: WEBHOOK_DELETE_QUERY,
      variables,
    }),
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        }
      }
    ).then((res) => res.data);
  }

  static createGraphQLUrl(shopifyDomain, apiVersion) {
    return `${shopifyDomain}/admin/api/${apiVersion}/graphql.json`;
  }
}

module.exports = ShopifyService;