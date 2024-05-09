const crypto = require('crypto');

const verifyWebhook = async (req, res, next) => {
    try {
        const message = req.rawBody;

        const hmacHeader = req.headers('x-shopify-hmac-sha256') || '';
        if (hmacHeader === '') {
            throw new Error('Unauthorization');
        }

        const hash = crypto.createHmac('sha256', 'b756128ae23ddd92edd9d41615e5d183').update(message).digest('base64');
        // console.log('hash', hash);
        // console.log('hmac', hmacHeader);

        const match = crypto.timingSafeEqual(
            Buffer.from(hash),
            Buffer.from(hmacHeader)
        );

        if (match) {
            return next();
        }
        throw new Error('');

    } catch (error) {
        console.log('verifyWebhook->error', error);
        return res.status(401).send(error instanceof Error ? error.message : 'Internal serve error');
    }
};

module.exports = verifyWebhook;