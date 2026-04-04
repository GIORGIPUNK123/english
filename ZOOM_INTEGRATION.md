# Zoom Integration Implementation Guide

## ✅ What Was Implemented

### 1. **Zoom API Module** (`functions/src/zoomFunctions.ts`)
- `generateZoomAccessToken()` - Get access token using Server-to-Server OAuth
- `createZoomMeeting()` - Create meeting using Zoom API
- `updateZoomMeeting()` - Reschedule meetings when lessons are rescheduled
- `deleteZoomMeeting()` - Delete meetings when lessons are cancelled

### 2. **Lesson Functions Integration**
- **scheduleLesson**: Added `zoom_meeting_id` field (initially null)
- **acceptLesson**: Creates Zoom meeting and stores `zoom_meeting_id`, `teacher_link`, `student_link`
- **rescheduleLesson**: Updates Zoom meeting with new time
- **cancelLesson**: Deletes Zoom meeting from Zoom servers

### 3. **Database Schema Updates**
- Added `zoom_meeting_id: number | null` to ClassesT interface
- Stores both teacher (start_url) and student (join_url) links

### 4. **Scheduled Function Updates**
- Removed test placeholder links
- Now just logs status of upcoming lessons

## 🔐 Environment Variables Required

Add these to your Firebase `.env` file or Firebase functions config:

```bash
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
```

### To Set Firebase Functions Environment Variables:

**Option 1: Using Firebase CLI**
```bash
firebase functions:config:set zoom.account_id="your_account_id" \
  zoom.client_id="your_client_id" \
  zoom.client_secret="your_client_secret"
```

**Option 2: Using .env.local in functions folder**
Create `functions/.env.local`:
```
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
```

## 🔄 How It Works

### Lesson Lifecycle with Zoom

1. **Student schedules lesson** → Lesson created with `zoom_meeting_id: null`
2. **Teacher accepts lesson** → 
   - Zoom meeting created automatically
   - `zoom_meeting_id`, `teacher_link`, `student_link` stored in Firestore
   - "Join Lesson" button becomes enabled
3. **Student clicks "Join Lesson"** → Opens Zoom join URL
4. **Teacher clicks "Join Lesson"** → Opens Zoom start URL (host mode)
5. **Lesson is rescheduled** → Zoom meeting updated with new time
6. **Lesson is cancelled** → Zoom meeting deleted from Zoom servers

## 🚨 Error Handling

All Zoom operations are non-blocking:
- If Zoom meeting creation fails, lesson still proceeds (manual link can be added later)
- Errors are logged but don't crash the function
- Frontend disables "Join Lesson" button if link is missing

## 📝 Response Updates

Functions now return:
- `acceptLesson`: `{ success: true, notificationsSent, zoomMeetingCreated }`
- Other functions: Standard success responses

## ✨ Frontend Already Supports

- `lesson.link` - Uses teacher or student link depending on user role
- "Join Lesson" button - Disabled if link is missing
- Links open in new window via `window.open(lesson.link, '_blank')`

## 🔗 Zoom Requirements

- Must have Server-to-Server OAuth app created in Zoom
- Account credentials (ID + Secret) required
- Credentials should NEVER be committed to git - use environment variables
