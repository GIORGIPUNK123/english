import axios from 'axios';
import base64 from 'base-64';

// Get credentials from environment variables
// These are automatically injected by Firebase when using functions:config:set
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID || '';
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || '';
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID || '';

/* =====================================================
   ZOOM: Generate Access Token
   ===================================================== */
export const generateZoomAccessToken = async (): Promise<string | null> => {
  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
    console.error('[Zoom] Missing Zoom credentials in environment variables');
    return null;
  }

  const base64Credentials = base64.encode(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`);

  try {
    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      null,
      {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const jsonResponse = response.data;
    return jsonResponse.access_token;
  } catch (error: any) {
    console.error(
      '[Zoom] Token generation failed:',
      error?.response?.status,
      error?.response?.data || error.message,
    );
    return null;
  }
};

/* =====================================================
   ZOOM: Get Meeting Start Time from Unix Timestamp
   ===================================================== */
const getZoomStartTimeFormat = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000); // Convert from seconds to ms
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const sec = String(date.getUTCSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec}`;
};

/* =====================================================
   ZOOM: Create Meeting
   ===================================================== */
type CreateZoomMeetingParams = {
  topic: string;
  startTime: number; // Unix timestamp in seconds
  duration?: number; // Minutes (default: 60)
  agenda?: string;
};

type ZoomMeetingResponse = {
  id: number; // Meeting ID
  join_url: string; // Participant join URL
  start_url: string; // Host start URL
  [key: string]: any;
};

export const createZoomMeeting = async (
  params: CreateZoomMeetingParams,
): Promise<ZoomMeetingResponse | null> => {
  const accessToken = await generateZoomAccessToken();

  if (!accessToken) {
    console.error('[Zoom] Failed to generate access token for meeting creation');
    return null;
  }

  const { topic, startTime, duration = 60, agenda = '' } = params;

  const options = {
    method: 'POST',
    url: 'https://api.zoom.us/v2/users/me/meetings',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      topic,
      agenda,
      type: 2, // Scheduled meeting
      start_time: getZoomStartTimeFormat(startTime),
      duration,
      timezone: 'UTC',
      default_password: false,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: false,
        waiting_room: true,
        auto_recording: 'cloud',
        participant_can_share_screen: true,
        allow_participants_to_annotate: false,
      },
    },
  };

  try {
    const { data } = await axios.request(options);
    console.log(
      `[Zoom] Meeting created successfully. ID: ${data.id}, Join URL: ${data.join_url}`,
    );
    return data as ZoomMeetingResponse;
  } catch (error: any) {
    console.error(
      '[Zoom] Meeting creation failed:',
      error?.response?.status,
      error?.response?.data || error.message,
    );
    return null;
  }
};

/* =====================================================
   ZOOM: Update Meeting
   ===================================================== */
type UpdateZoomMeetingParams = {
  meetingId: number;
  topic?: string;
  startTime?: number; // Unix timestamp in seconds
  duration?: number;
  agenda?: string;
};

export const updateZoomMeeting = async (
  params: UpdateZoomMeetingParams,
): Promise<boolean> => {
  const accessToken = await generateZoomAccessToken();

  if (!accessToken) {
    console.error('[Zoom] Failed to generate access token for meeting update');
    return false;
  }

  const { meetingId, topic, startTime, duration = 60, agenda = '' } = params;

  const data: Record<string, any> = {};
  if (topic) data.topic = topic;
  if (agenda) data.agenda = agenda;
  if (duration) data.duration = duration;
  if (startTime) data.start_time = getZoomStartTimeFormat(startTime);

  try {
    await axios.patch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    console.log(`[Zoom] Meeting updated successfully. ID: ${meetingId}`);
    return true;
  } catch (error: any) {
    console.error(
      '[Zoom] Meeting update failed:',
      error?.response?.status,
      error?.response?.data || error.message,
    );
    return false;
  }
};

/* =====================================================
   ZOOM: Delete Meeting
   ===================================================== */
export const deleteZoomMeeting = async (meetingId: number): Promise<boolean> => {
  const accessToken = await generateZoomAccessToken();

  if (!accessToken) {
    console.error('[Zoom] Failed to generate access token for meeting deletion');
    return false;
  }

  try {
    await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`[Zoom] Meeting deleted successfully. ID: ${meetingId}`);
    return true;
  } catch (error: any) {
    console.error(
      '[Zoom] Meeting deletion failed:',
      error?.response?.status,
      error?.response?.data || error.message,
    );
    return false;
  }
};
