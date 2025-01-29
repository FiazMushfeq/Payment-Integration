const axios = require('axios')

async function generateAccessToken() {
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
        method: 'POST',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    })

    console.log(response.data)
    return response.data.access_token
}

// generateAccessToken()

exports.createOrder = async () => {
    const accessToken = await generateAccessToken()
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                items: [{
                    name: 'Node.js Complete Course',
                    description: 'Node.js Complete Course with Express and MongoDB',
                    quantity: '1',
                    unit_amount: {
                        currency_code: 'USD',
                        value: '100.00'
                    }
                }],
                amount: {
                    currency_code: 'USD',
                    value: '100.00',
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: '100.00'
                        }
                    }
                }
            }],
            application_context: {
                return_url: process.env.BASE_URL + '/complete-order',
                cancel_url: process.env.BASE_URL + '/cancel-order',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'Mooshy Store'
            }
        })
    })
    console.log(response.data)
    return response.data.links.find(link => link.rel === 'approve').href
}

// this.createOrder().then(result => console.log(result))

exports.capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken()
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return response.data
}