# React UI with Google Maps API Integration

This directory contains a simple React UI for user registration with Google Maps Places Autocomplete integration.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API** for your project
4. Go to **APIs & Services > Credentials**
5. Create an API key
6. (Optional but recommended) Restrict the API key to only allow Places API

### 2. Configure the API Key

Open `public/index.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places`;
```

### 3. Run the Backend Server

Make sure your backend server is running:

```bash
npm run dev
```

The server should be running on `http://localhost:8000` (or the port specified in your `.env` file).

### 4. Access the UI

Open `public/index.html` in your web browser:

- **Option 1**: Open the file directly by double-clicking it
- **Option 2**: Use a local server (recommended for better CORS handling):
  ```bash
  # Using Python 3
  python3 -m http.server 3000
  
  # Or using Node.js http-server
  npx http-server public -p 3000
  ```
  Then navigate to `http://localhost:3000`

## Features

- **Auto-complete Location**: Start typing in the location field to see Google Maps suggestions
- **Form Validation**: All fields are required before submission
- **API Integration**: Submits data to the backend API at `/api/v1/users/register`
- **Responsive Design**: Works on desktop and mobile devices
- **User Feedback**: Shows success/error messages after form submission

## Usage

1. Fill in your name, email, and password
2. Click on the location field and start typing
3. Select a location from the Google Maps suggestions
4. Click "Create Account" to register

## Notes

- The backend server must be running for the form submission to work
- Make sure CORS is properly configured in your backend (already set to allow `http://localhost:3000`)
- The Google Maps API key should be kept secure in production environments
- Consider implementing API key restrictions in the Google Cloud Console

## Security Considerations

⚠️ **Important**: The API key is currently exposed in the frontend code. For production use:

1. Implement API key restrictions in Google Cloud Console
2. Restrict by HTTP referrers (websites)
3. Consider using a backend proxy to hide the API key
4. Enable billing alerts to monitor API usage
