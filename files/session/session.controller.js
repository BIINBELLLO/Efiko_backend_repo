const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { SessionService } = require("./session.service")
const crypto = require("crypto")

const createSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.createSession(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.updateSessionService(
      req.params.id,
      req.body,
      res.locals.jwt._id
    )
  )
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.getSessionService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const rateSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.rateSessionService(req.params.id, req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getReviewServiceController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.getReviewService(req.params.id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getZoomSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(SessionService.getZoomSession())

  console.log("error", error)

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const zoomWebhookController = async (req, res, next) => {
  try {
    console.log("req.headers", req.headers)
    console.log("req.body", req.body)

    // Construct the message string
    const message = `v0:${
      req.headers["x-zm-request-timestamp"]
    }:${JSON.stringify(req.body)}`

    // Calculate HMAC signature for request validation
    const hashForVerify = crypto
      .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
      .update(message)
      .digest("hex")

    // Compare calculated signature with the received signature
    const signature = `v0=${hashForVerify}`
    console.log("signature", signature)

    if (req.headers["x-zm-signature"] === signature) {
      // Request came from Zoom and is validated

      if (req.body.event === "endpoint.url_verification") {
        // Handle URL verification

        // Calculate HMAC hash for URL validation
        const hashForValidate = crypto
          .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
          .update(req.body.payload.plainToken)
          .digest("hex")

        console.log("hashForValidate", hashForValidate)

        // Respond with the calculated hash for URL validation
        const response = {
          message: {
            plainToken: req.body.payload.plainToken,
            encryptedToken: hashForValidate,
          },
        }

        console.log("response.message", response.message)

        res.status(200).json(response)
      } else {
        // Authorized request to Zoom Webhook sample. Implement your business logic here.

        const response = {
          message: "Authorized request to Zoom Webhook sample.",
          status: 200,
        }

        console.log("response.message", response.message)

        res.status(200).json(response)
      }
    } else {
      // Unauthorized request
      const response = {
        message: "Unauthorized request to Zoom Webhook sample.",
        status: 401,
      }

      console.log(response.message)

      res.status(401).json(response)
    }
  } catch (error) {
    console.error("zoom error", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
module.exports = {
  createSessionController,
  updateSessionController,
  getSessionController,
  rateSessionController,
  getReviewServiceController,
  getZoomSessionController,
  zoomWebhookController,
}
