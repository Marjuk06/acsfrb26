// Authentication System with Device Tracking
class AuthSystem {
    constructor() {
        this.SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
        this.SESSION_KEY = 'bppowerplay_session';
        this.DEVICE_KEY = 'bppowerplay_device';
        this.USER_KEY = 'bppowerplay_user';
        this.init();
    }

    init() {
        // Check if user is already authenticated
        this.checkSession();

        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.handleAuthStateChange(user);
            } else {
                this.showLoginModal();
            }
        });

        // Check for multiple device logins periodically
        setInterval(() => this.checkDeviceSession(), 30000); // Check every 30 seconds
    }

    async checkSession() {
        const sessionData = this.getSession();

        if (!sessionData) {
            this.showLoginModal();
            return false;
        }

        const now = Date.now();
        const sessionExpiry = sessionData.expiry;

        if (now > sessionExpiry) {
            // Session expired
            this.clearSession();
            this.showLoginModal();
            return false;
        }

        // Verify session with Firebase
        try {
            const user = auth.currentUser;
            if (!user) {
                // Try to restore session
                await this.restoreSession(sessionData.email);
            } else {
                // Verify device
                await this.verifyDevice(user.email);
            }
            return true;
        } catch (error) {
            console.error('Session check error:', error);
            this.clearSession();
            this.showLoginModal();
            return false;
        }
    }

    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Generate device ID
            const deviceId = this.generateDeviceId();

            // Store device info in Firestore
            await this.storeDeviceInfo(user.email, deviceId);

            // Create session
            const sessionData = {
                email: user.email,
                uid: user.uid,
                deviceId: deviceId,
                loginTime: Date.now(),
                expiry: Date.now() + this.SESSION_DURATION
            };

            this.saveSession(sessionData);
            this.saveDeviceId(deviceId);
            this.saveUserEmail(user.email);

            // Hide login modal
            this.hideLoginModal();

            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const sessionData = this.getSession();
            if (sessionData && sessionData.email) {
                // Remove device info from Firestore
                await this.removeDeviceInfo(sessionData.email);
            }

            await auth.signOut();
            this.clearSession();
            this.showLoginModal();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async verifyDevice(email) {
        try {
            const currentDeviceId = this.getDeviceId();
            if (!currentDeviceId) {
                await this.logout();
                this.showMultipleDeviceWarning();
                return false;
            }

            const deviceDoc = await db.collection('userDevices').doc(email).get();

            if (!deviceDoc.exists) {
                await this.logout();
                this.showMultipleDeviceWarning();
                return false;
            }

            const deviceData = deviceDoc.data();
            const storedDeviceId = deviceData.deviceId;
            const lastLogin = deviceData.lastLogin || 0;

            // Check if device ID matches
            if (storedDeviceId !== currentDeviceId) {
                // Different device detected
                await this.logout();
                this.showMultipleDeviceWarning();
                return false;
            }

            // Update last verified time
            await db.collection('userDevices').doc(email).update({
                lastVerified: Date.now()
            });

            return true;
        } catch (error) {
            console.error('Device verification error:', error);
            return false;
        }
    }

    async storeDeviceInfo(email, deviceId) {
        try {
            await db.collection('userDevices').doc(email).set({
                deviceId: deviceId,
                lastLogin: Date.now(),
                lastVerified: Date.now(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            }, { merge: true });
        } catch (error) {
            console.error('Store device info error:', error);
        }
    }

    async removeDeviceInfo(email) {
        try {
            await db.collection('userDevices').doc(email).delete();
        } catch (error) {
            console.error('Remove device info error:', error);
        }
    }

    async checkDeviceSession() {
        const sessionData = this.getSession();
        if (sessionData && sessionData.email) {
            await this.verifyDevice(sessionData.email);
        }
    }

    async restoreSession(email) {
        try {
            // Session restoration would require re-authentication
            // For security, we'll just show login modal
            this.showLoginModal();
        } catch (error) {
            console.error('Restore session error:', error);
            this.showLoginModal();
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            this.verifyDevice(user.email);
        } else {
            this.showLoginModal();
        }
    }

    generateDeviceId() {
        // Generate a unique device ID based on browser fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);

        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        return 'device_' + Math.abs(hash).toString(36);
    }

    saveSession(sessionData) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    }

    getSession() {
        const sessionStr = localStorage.getItem(this.SESSION_KEY);
        return sessionStr ? JSON.parse(sessionStr) : null;
    }

    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.DEVICE_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    saveDeviceId(deviceId) {
        localStorage.setItem(this.DEVICE_KEY, deviceId);
    }

    getDeviceId() {
        return localStorage.getItem(this.DEVICE_KEY);
    }

    saveUserEmail(email) {
        localStorage.setItem(this.USER_KEY, email);
    }

    getUserEmail() {
        return localStorage.getItem(this.USER_KEY);
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showMultipleDeviceWarning() {
        const warning = document.getElementById('multipleDeviceWarning');
        if (warning) {
            warning.style.display = 'block';
            setTimeout(() => {
                warning.style.display = 'none';
            }, 10000); // Show for 10 seconds
        }
    }
}

// Initialize auth system after Firebase is loaded
let authSystem;

function initAuthSystem() {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        authSystem = new AuthSystem();
        window.authSystem = authSystem;
    } else {
        // Wait for Firebase to load
        setTimeout(initAuthSystem, 100);
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
    initAuthSystem();
}

