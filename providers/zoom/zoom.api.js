const axios = require("axios")

const accountCredentials = "account_credentials"

class ZoomAPiServiceProvider {
  static async initiateZoomMeeting() {
    try {
      let access_token = await this.getAccessToken()

      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      }

      const payload = {
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
      }

      const meetingResponse = await axios.post(
        `https://api.zoom.us/v2/users/me/meetings`,
        payload,
        { headers }
      )

      if (meetingResponse.status !== 201) {
        throw new Error("Unable to generate meeting link")
      }

      const response_data = meetingResponse.data

      const content = {
        meeting_url: response_data.join_url,
        password: response_data.password,
        meetingTime: response_data.start_time,
        purpose: response_data.topic,
        duration: response_data.duration,
        message: "Success",
        status: 1,
      }

      return { success: true, msg: "Meeting created", content }
    } catch (error) {
      console.error(error)
      return { success: false, msg: "Error creating meeting" }
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

//getting meeting record link
/**
 * 
 * 
   // After the meeting is created, get recording information
      const recordingResponse = await axios.get(
        `https://api.zoom.us/v2/meetings/${response_data.id}/recordings`,
        { headers }
      );

      if (recordingResponse.status !== 200) {
        throw new Error("Unable to retrieve recording information");
      }

      const recordingData = recordingResponse.data;
 */
