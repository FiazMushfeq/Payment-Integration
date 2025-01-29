require('dotenv').config()
const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const app = express()

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.post('/checkout', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Node.js and Express book',
                    },
                    unit_amount: 50 * 100,
                },
                quantity: 1,
            },
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'JavaScript T-Shirt',
                    },
                    unit_amount: 20 * 100, // each unit is 20 USD
                },
                quantity: 2,
            },
        ],
        mode: 'payment',
        shipping_address_collection: {
            allowed_countries: ['US', 'CA'],
        },
        success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel`,
    })
    res.redirect(session.url)
})

app.get('/complete', async (req, res) => {
    const result = Promise.all([
        stripe.checkout.sessions.retrieve(req.query.session_id, {expand: ['payment_intent.payment_method']}),
        stripe.checkout.sessions.listLineItems(req.query.session_id)
    ])

    // const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {expand: ['payment_intent.payment_method']})
    // const lineItems = await stripe.checkout.sessions.listLineItems(req.query.session_id)

    // console.log(session)
    // console.log(lineItems)

    console.log(JSON.stringify(await result))

    res.send('Your payment has been completed!')
})

app.get('/cancel', (req, res) => {
    res.redirect('/')
})

app.listen(3000, () => console.log('Server is running on port 3000...'))