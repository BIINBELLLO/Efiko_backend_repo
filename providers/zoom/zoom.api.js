const axios = require("axios")

const accountCredentials = "account_credentials"

class ZoomAPiServiceProvider {
  static async initiateZoomMeeting(body) {
    try {
      let access_token = await this.getAccessToken()

      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      }

      const payload = {
        topic: body.title,
        start_time: body.time,
        type: 2,
        duration: body.duration,
        timezone: body.timezone,
        agenda: body.description,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pm: false,
          audio: "both",
          auto_recording: "cloud",
        },
      }

      const meetingResponse = await axios.post(
        `https://api.zoom.us/v2/users/me/meetings`,
        payload,
        { headers }
      )

      if (meetingResponse.status !== 201) {
        return { success: false, msg: "Unable to generate meeting link" }
      }

      const response_data = meetingResponse.data

      const content = {
        meeting_url: response_data.join_url,
        password: response_data.password,
        meetingId: response_data.id,
        meetingTime: response_data.start_time,
        purpose: response_data.topic,
        duration: response_data.duration,
        message: "Success",
        status: 1,
      }

      return content
    } catch (error) {
      console.error(error)
      return { success: false, msg: "Error creating meeting" }
    }
  }

  static async getZoomMeeting(body) {
    try {
      let access_token = await this.getAccessToken()

      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      }

      const zoomResponse = await axios.get(
        // `https://api.zoom.us/v2/meetings/89914548453`,
        `https://api.zoom.us/v2/meetings/${89914548453}/recordings`,
        { headers }
      )

      console.log("zoomResponse", zoomResponse)
      const meetingDetails = zoomResponse.data
      let recordingDetails

      // Check if recording files are present
      if (
        meetingDetails.recording_files &&
        meetingDetails.recording_files.length > 0
      ) {
        recordingDetails = meetingDetails.recording_files.map((file) => ({
          recordingId: file.id,
          recordingType: file.recording_type,
          recordingUrl: file.download_url,
        }))
      }

      const response_data = zoomResponse.data
    } catch (error) {
      console.error(error)
      return { success: false, msg: "Error getting meeting" }
    }
  }

  static async getAccessToken() {
    try {
      const authResponse = await axios.post(
        "https://zoom.us/oauth/token",
        null,
        {
          params: {
            grant_type: accountCredentials,
            account_id: process.env.ZOOM_ACCOUNT_ID,
            client_secret: process.env.ZOOM_CLIENT_SECRET,
          },
          auth: {
            username: process.env.ZOOM_CLIENT_ID,
            password: process.env.ZOOM_CLIENT_SECRET,
          },
        }
      )

      if (authResponse.status !== 200) {
        throw new Error("Unable to get access token")
      }
      const access_token = authResponse.data.access_token

      return access_token
    } catch (error) {
      console.error(error)
      throw new Error("Error getting access token")
    }
  }
}

module.exports = { ZoomAPiServiceProvider }
