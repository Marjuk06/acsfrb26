# Deployment Guide for Bondi Pathshala Power Play 26

## Prerequisites

1. **Firebase CLI** - Install if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account** - Make sure you're logged in:
   ```bash
   firebase login
   ```

3. **Firebase Project** - Ensure project `bppowerplay-26` exists in Firebase Console

## Deployment Steps

### 1. Verify Firebase Configuration

Make sure `firebase-config.js` has your actual Firebase credentials:
- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId

### 2. Build/Update Version (Optional)

If you have a deploy script that updates version numbers:
```bash
npm run build
```

### 3. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Or deploy everything:
```bash
firebase deploy
```

### 4. Deploy to Specific Site

If you need to deploy to a specific site:
```bash
firebase deploy --only hosting:bppowerplay-26
```

## Post-Deployment

1. **Verify Deployment**
   - Visit: https://bppowerplay-26.web.app
   - Check all pages are accessible
   - Test authentication login
   - Verify all functionality works

2. **Check Firebase Console**
   - Go to Firebase Console > Hosting
   - Verify the deployment is live
   - Check deployment history

3. **Test Authentication**
   - Make sure users can login
   - Test session management (1 week)
   - Verify multi-device detection works

## Troubleshooting

### Firebase CLI Not Found
```bash
npm install -g firebase-tools
```

### Not Logged In
```bash
firebase login
```

### Project Not Found
1. Go to Firebase Console
2. Create project: `bppowerplay-26`
3. Enable Hosting
4. Run: `firebase use bppowerplay-26`

### Deployment Errors
- Check `firebase.json` configuration
- Verify `public` folder exists
- Check Firebase project settings
- Ensure hosting is enabled in Firebase Console

## Git Repository Setup

After deployment, set up Git repository:

```bash
git init
git add .
git commit -m "Initial commit - Bondi Pathshala Power Play 26"
git branch -M main
git remote add origin https://github.com/Marjuk06/bppowerplay-26.git
git push -u origin main
```

## Environment Setup

Make sure these are configured:
- ✅ Firebase project: `bppowerplay-26`
- ✅ Firebase Authentication enabled
- ✅ Firestore Database enabled
- ✅ Users added in Authentication console
- ✅ Firestore security rules set
- ✅ Firebase config updated in `firebase-config.js`

