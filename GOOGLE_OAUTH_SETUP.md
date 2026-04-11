# Google OAuth Setup Instructions

## Error: "The OAuth client was not found"

This error occurs when Google OAuth is not properly configured. Follow these steps to fix it:

## Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID (Web application)
5. Click on it to edit

### Add Authorized Redirect URIs:

Add the following redirect URIs:
- `http://localhost:5000/auth/google/callback` (for local development)
- `https://ads-agency-portal.onrender.com/auth/google/callback` (for production)

Click **Save**.

## Step 2: Configure Render Environment Variables

1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (`ads-agency-backend`)
3. Go to **Environment** tab
4. Add/Update the following environment variables:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID (from Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret (from Google Cloud Console) |

5. Click **Save Changes**

## Step 3: Redeploy Render

After updating the environment variables, manually trigger a redeploy:
1. Go to **Manual Deploy** section
2. Click **Deploy Latest Commit**

## Step 4: Verify

After deployment completes, test the Google Sign-In:
1. Go to `https://ads-agency-portal.vercel.app/login`
2. Click "Continue with Google"
3. You should be redirected to Google for authentication

## Troubleshooting

### If you still see "The OAuth client was not found":

1. **Verify Client ID format**: The Client ID should look like:
   `123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`

2. **Verify Client Secret**: The Client Secret should be a long string like:
   `GOCSPX-abcdefghijklmnopqrstuvwxyz`

3. **Check Google Cloud Console**:
   - Make sure the OAuth consent screen is configured
   - Make sure the app is not in testing mode (or add your test email to test users)

4. **Check Render Logs**:
   - Go to Render Dashboard > your service > Logs
   - Look for any errors related to Google OAuth

### If you see "Access blocked: This app's request is invalid"

This means the redirect URI doesn't match. Make sure:
- The redirect URI in Google Cloud Console exactly matches `https://ads-agency-portal.onrender.com/auth/google/callback`
- No trailing slashes or extra characters

## Local Development

For local development, update your `.env` file:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

And add `http://localhost:5000/auth/google/callback` to authorized redirect URIs in Google Cloud Console.