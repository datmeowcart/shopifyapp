const receive = async (req, res) => {
    const topic = req.headers['x-shopify-topic'];
    const payload = req.body;
    switch (topic) {
        case 'SHOP_REACT':
            break;
        case 'CUSTOMER_REDACT':
            break;
        case 'orders/create':
            break;
        default:
            break;
    }
    return res.send('Hello Dat');
};

module.exports = { receive };