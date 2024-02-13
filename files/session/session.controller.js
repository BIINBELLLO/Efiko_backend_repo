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
    SessionService.getSessionService(req.query, res.locals.jwt)
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
    var response

    // construct the message string
    const message = `v0:${
      req.headers["x-zm-request-timestamp"]
    }:${JSON.stringify(req.body)}`

    const hashForVerify = crypto
      .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
      .update(message)
      .digest("hex")

    // hash the message string with your Webhook Secret Token and prepend the version semantic
    const signature = `v0=${hashForVerify}`

    // you validating the request came from Zoom
    if (req.headers["x-zm-signature"] === signature) {
      // Zoom validating you control the webhook endpoint
      if (req.body.event === "endpoint.url_validation") {
        const hashForValidate = crypto
          .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
          .update(req.body.payload.plainToken)
          .digest("hex")

        response = {
          message: {
            plainToken: req.body.payload.plainToken,
            encryptedToken: hashForValidate,
          },
          status: 200,
        }

        res.status(response.status)
        res.json(response.message)
      } else {
        const event = req.body
        const [error, data] = await manageAsyncOps(
          SessionService.zoomSessionWebhookService(event)
        )
        response = {
          message: "Authorized request to Zoom Webhook sample.",
          status: 200,
        }

        res.status(response.status)
        res.json(response)
      }
    } else {
      response = {
        message: "Unauthorized request to Zoom Webhook sample.",
        status: 401,
      }
      res.status(response.status)
      res.json(response)
    }
  } catch (error) {
    console.log("zoom error", error)
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
