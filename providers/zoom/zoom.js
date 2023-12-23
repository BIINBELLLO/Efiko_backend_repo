const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const payload = {
  iss: process.env.ZOOM_CLIENT_ID,
  exp: new Date().getTime() + 5000,
}

// const token = jwt.sign(payload, process.env.AUTH_TOKEN)
const accessToken = process.env.ACCESS_TOKEN

const RequestHandler = require("../../utils/axios.provision")
const { providerMessages } = require("../providers.messages")

class ZoomProviderService {
  zoomRequestHandler = RequestHandler.setup({
    baseURL: "https://api.zoom.us",
    headers: {
      Accept: "application/json, text/plain",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "axios/1.4.0",
      "Content-Length": "34",
      "Accept-Encoding": "gzip, compress, deflate, br",
      // timeout: 10000,
    },
  })

  async getZoomMeeting() {
    try {
      const zoomMeetingResponse = await this.zoomRequestHandler({
        method: "GET",
        url: "/oauth/token",
        params: {
          grant_type: "authorization_code",
          code: "jS6FZl628bZWjBI-U_DSnGDe-M71Y1Myg",
          redirect_uri: "http://localhost:5500",
        },
        headers: {
          auth: {
            username: process.env.ZOOM_CLIENT_ID,
            password: process.env.ZOOM_CLIENT_SECRET,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
        // headers: {
        //   Authorization: `Bearer ${Buffer.from(
        //     `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        //   ).toString("base64")}`,
        // },
      })
      const accessToken = zoomMeetingResponse.data.access_token
      res.send(`Access Token: ${accessToken}`)
      console.log("zoom response", zoomMeetingResponse.data)
    } catch (error) {
      console.log("new error", error)
    }

    return {
      success: true,
      msg: providerMessages.INITIATE_PAYMENT_SUCCESS,
    }
  }
  async initiateZoomMeeting() {
    try {
      const zoomMeetingResponse = await this.zoomRequestHandler({
        method: "POST",
        url: "/v2/users/me/meetings",
        params: {
          grant_type: "account_credentials",
          account_id: process.env.ZOOM_ACCOUNT_ID,
          client_secret: process.env.ZOOM_CLIENT_SECRET,
        },
        headers: {
          auth: {
            username: process.env.ZOOM_CLIENT_ID,
            password: process.env.ZOOM_CLIENT_SECRET,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
        data: {
          topic: "new setup",
          start_time: "2024-12-19T17:28",
          type: 2,
          duration: 45,
          timezone: "UTC",
          agenda: "this is for the team meeting",
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            watermark: false,
            use_pm: false,
            audio: "both",
            auto_recording: "none",
          },
        },
      })

      console.log("zoom response", zoomMeetingResponse)
    } catch (error) {
      console.log("new error", error)
    }

    return {
      success: true,
      msg: providerMessages.INITIATE_PAYMENT_SUCCESS,
    }
  }
}

module.exports = { ZoomProviderService }
