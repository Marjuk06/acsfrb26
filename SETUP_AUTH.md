# Authentication System Setup Guide

## Overview
This website uses Firebase Authentication with email/password login, 1-week sessions, and multi-device detection.

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named `bppowerplay-26`
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Disable "Email link (passwordless sign-in)"

### 2. Add Users
1. Go to Authentication > Users
2. Click "Add user"
3. Enter email (e.g., `marjukamin5540@gmail.com`)
4. Set a password
5. Click "Add user"

### 3. Enable Firestore
1. Go to Firestore Database
2. Click "Create database"
3. Start in "Production mode"
4. Choose a location
5. Click "Enable"

### 4. Set Firestore Rules
Go to Firestore > Rules and set:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userDevices/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
  }
}
```

### 5. Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon (`</>`)
4. Register app with nickname "Web App"
5. Copy the config values

### 6. Update firebase-config.js
Edit `public/firebase-config.js` and replace:
- `YOUR_API_KEY` with your apiKey
- `YOUR_PROJECT_ID` with your projectId
- `YOUR_STORAGE_BUCKET` with your storageBucket
- `YOUR_MESSAGING_SENDER_ID` with your messagingSenderId
- `YOUR_APP_ID` with your appId

## Deployment

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase (if not already done)
```bash
firebase init hosting
```
- Select existing project: `bppowerplay-26`
- Public directory: `public`
- Single-page app: `Yes`
- Overwrite index.html: `No`

### 4. Deploy
```bash
firebase deploy --only hosting
```

## Git Repository Setup

```bash
echo "# bppowerplay-26" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Marjuk06/bppowerplay-26.git
git push -u origin main
```

## How It Works

### Authentication Flow
1. User visits website
2. Login modal appears (if not authenticated)
3. User enters email/password
4. System authenticates with Firebase
5. Device ID is generated and stored
6. Session saved (valid for 1 week)
7. Device info stored in Firestore

### Multi-Device Detection
1. System checks device ID every 30 seconds
2. If different device ID detected:
   - User is logged out
   - Warning message shown
   - Previous device session invalidated

### Session Management
- Sessions last 1 week (7 days)
- Stored in localStorage
- Automatically expires after 1 week
- User must login again after expiry

## Security Features
- Email/password authentication via Firebase
- Device fingerprinting for multi-device detection
- Session expiration (1 week)
- Automatic logout on device mismatch
- Firestore rules prevent unauthorized access

## Troubleshooting

### Login not working
- Check Firebase config in `firebase-config.js`
- Verify user exists in Firebase Authentication
- Check browser console for errors
- Verify Firestore is enabled

### Multiple device warning appears incorrectly
- Clear browser cache and localStorage
- Check Firestore rules
- Verify device ID generation

### Session expires too quickly
- Check `SESSION_DURATION` in `auth.js` (default: 7 days)
- Verify system time is correct

