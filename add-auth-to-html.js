// Script to add authentication to all HTML files
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const htmlFiles = [
    'index.html',
    'chapters.html',
    'lectures.html',
    'video-player.html',
    'pdf-viewer.html',
    'routine.html',
    'converter.html'
];

const firebaseScripts = `    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
    `;

const loginModal = `
    <!-- Login Modal -->
    <div id="loginModal" class="login-modal">
        <div class="login-modal-content">
            <div class="login-header">
                <div class="login-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h2>Bondi Pathshala Power Play 26</h2>
                <p>Please login to access the content</p>
            </div>
            
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <label for="loginEmail">
                        <i class="fas fa-envelope"></i>
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        id="loginEmail" 
                        name="email" 
                        placeholder="Enter your email" 
                        required 
                        autocomplete="email"
                    >
                </div>
                
                <div class="form-group">
                    <label for="loginPassword">
                        <i class="fas fa-key"></i>
                        Password
                    </label>
                    <input 
                        type="password" 
                        id="loginPassword" 
                        name="password" 
                        placeholder="Enter your password" 
                        required 
                        autocomplete="current-password"
                    >
                </div>
                
                <div id="loginError" class="error-message" style="display: none;"></div>
                
                <button type="submit" class="login-button" id="loginSubmitBtn">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                </button>
            </form>
            
            <div class="login-footer">
                <p>Session valid for 1 week</p>
            </div>
        </div>
    </div>

    <!-- Multiple Device Warning -->
    <div id="multipleDeviceWarning" class="multiple-device-warning" style="display: none;">
        <div class="warning-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Multiple Device Detected</h3>
            <p>Your account has been logged in from another device. You have been logged out for security reasons.</p>
            <button onclick="document.getElementById('multipleDeviceWarning').style.display='none'">OK</button>
        </div>
    </div>
`;

const authScripts = `
    <!-- Firebase Config and Auth -->
    <script src="firebase-config.js"></script>
    <script src="auth.js"></script>
    
    <!-- Login Handler -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const loginForm = document.getElementById('loginForm');
            const loginError = document.getElementById('loginError');
            const loginSubmitBtn = document.getElementById('loginSubmitBtn');

            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;

                    loginError.style.display = 'none';
                    loginSubmitBtn.disabled = true;
                    loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Logging in...</span>';

                    try {
                        if (window.authSystem) {
                            await window.authSystem.login(email, password);
                        } else {
                            throw new Error('Authentication system not initialized');
                        }
                    } catch (error) {
                        console.error('Login error:', error);
                        loginError.textContent = error.message || 'Invalid email or password. Please try again.';
                        loginError.style.display = 'block';
                        loginSubmitBtn.disabled = false;
                        loginSubmitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Login</span>';
                    }
                });
            }
        });
    </script>
`;

htmlFiles.forEach(file => {
    const filePath = path.join(publicDir, file);

    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - file not found`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already has Firebase scripts
    if (content.includes('firebase-app-compat.js')) {
        console.log(`${file} already has Firebase scripts`);
    } else {
        // Add Firebase scripts before closing </head>
        content = content.replace(
            /(<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome[^>]*>)/,
            `$1\n${firebaseScripts}`
        );
    }

    // Check if already has login modal
    if (content.includes('loginModal')) {
        console.log(`${file} already has login modal`);
    } else {
        // Add login modal before closing </body> or before first <script>
        if (content.includes('</body>')) {
            content = content.replace('</body>', `${loginModal}\n    </body>`);
        } else if (content.includes('<script')) {
            const firstScriptIndex = content.indexOf('<script');
            content = content.slice(0, firstScriptIndex) + loginModal + '\n    ' + content.slice(firstScriptIndex);
        }
    }

    // Check if already has auth scripts
    if (content.includes('firebase-config.js')) {
        console.log(`${file} already has auth scripts`);
    } else {
        // Add auth scripts before other scripts
        if (content.includes('<script src="script.js')) {
            content = content.replace(
                /(<script src="script\.js[^>]*>)/,
                `${authScripts}\n    $1`
            );
        } else if (content.includes('<script>')) {
            content = content.replace(
                /(<script>)/,
                `${authScripts}\n    $1`
            );
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});

console.log('All HTML files updated with authentication!');

