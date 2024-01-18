const stripe = require("stripe")(process.env.STRIPE_KEY)

const stripePaymentIntent = async (payload) => {
  const { amount, currency } = payload

  if (!amount && !currency)
    return { success: false, msg: `amount and currency cannot be empty` }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

module.exports = { stripePaymentIntent }
