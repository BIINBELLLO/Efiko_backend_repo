const mongoose = require("mongoose")
const { config } = require("../../core/config")
const { UserRepository } = require("../../files/user/user.repository")
const stripe = require("stripe")(config.STRIPE_SECRET_KEY)

class StripePaymentService {
  checkSuccessStatus(status, gatewayResponse) {
    if (status === "success") return { success: true, msg: gatewayResponse }

    return { success: false, msg: gatewayResponse }
  }

  async createCheckOutSession(paymentPayload) {
    const { priceId, userId, uuid } = paymentPayload

    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(userId),
    })

    if (!user) return { success: false, msg: `user not found` }

    try {
      if (!user.stripeCustomerId) {
        //- create stripe customer and save if not created to stripe side yet
        let stripeCustomer = await stripe.customers.create({
          email: user.email,
        })

        user.stripeCustomerId = stripeCustomer.id
        await user.save()
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer: user.stripeCustomerId,
        mode: `payment`,
        success_url: `${process.env.STRIPE_SUCCESS_CALLBACK}/user/payment-success?userId=${user._id}&uuid=${uuid}`,
        cancel_url: `${process.env.STRIPE_CANCEL_CALLBACK}/user/service?userId=${user._id}&uuid=${uuid}`,
      })

      return session
    } catch (error) {
      return { success: false, msg: error.message }
    }
  }

  async createProductId(title, currency, amount) {
    try {
      const product = await stripe.products.create({
        name: title,
      })

      if (!product.id)
        return { success: false, msg: `Unable to create Id for product` }

      let centAmount = `${amount}00`

      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: centAmount,
        currency,
      })

      return price.id
    } catch (error) {
      console.log("error", error.message)
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
