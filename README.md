# Bondi Pathshala Power Play 26

Educational platform for HSC 2026 students with video lectures, study materials, and interactive learning resources.

## Features

- 📹 Video lectures with custom player
- 📝 Chapter notes and study materials
- 🔐 Secure authentication system
- 📱 Progressive Web App (PWA) support
- 🎨 Modern, responsive design
- 🔒 Multi-device login detection

## Authentication

The website uses Firebase Authentication with:
- Email/password login
- 1-week session duration
- Multi-device detection (only one device per account)
- Automatic logout on device mismatch

## Setup

See [SETUP_AUTH.md](./SETUP_AUTH.md) for detailed authentication setup instructions.

## Deployment

Deployed to: https://bppowerplay-26.web.app

## Development

```bash
# Install dependencies
npm install

# Start local server
npm start

# Deploy to Firebase
npm run deploy
```

## Tech Stack

- HTML5, CSS3, JavaScript
- Firebase (Authentication, Firestore)
- Progressive Web App (PWA)
- Service Worker for offline support

## License

MIT License

## Author

Developed by Marjuk Amin
