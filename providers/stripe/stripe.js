const { config } = require("../../core/config")
const { stripePaymentIntent } = require("../../utils/stripe")
const { providerMessages } = require("../providers.messages")
// const stripe = require("stripe")(process.env.STRIPE_KEY)

class StripePaymentService {
  checkSuccessStatus(status, gatewayResponse) {
    if (status === "success") return { success: true, msg: gatewayResponse }

    return { success: false, msg: gatewayResponse }
  }

  async initiatePaymentIntent(paymentPayload) {
    const { amount, currency } = paymentPayload
    const stripe = await stripePaymentIntent({ amount, currency })

    if (!stripe) return { success: false, msg: `unable to initiate payment` }

    return {
      success: true,
      msg: `Payment initiation successful`,
      clientSecret: stripe.client_secret,
      transactionId: stripe.id,
    }
  }

  async retrieveCheckOutSession(payload) {
    try {
      const session = await stripe.checkout.sessions.retrieve(`${payload}`)
      return session
    } catch (error) {
      console.log("error", error.message)
    }
  }
}

module.exports = { StripePaymentService }
