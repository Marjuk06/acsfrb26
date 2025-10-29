document.addEventListener('DOMContentLoaded', function () {
    // Load dynamic counts from JSON
    loadDynamicCounts();

    // Handle chapter card clicks
    const chapterCards = document.querySelectorAll('.chapter-card');
    chapterCards.forEach(card => {
        card.addEventListener('click', function () {
            const chapterId = this.getAttribute('data-chapter');

            if (chapterId === '3') {
                // Navigate to chapters page for Cycle 3
                window.location.href = 'chapters';
            } else if (chapterId === '3-1') {
                // Navigate to lectures page for Chapter 2
                window.location.href = 'lectures';
            }
        });
    });

    // Handle lecture card clicks
    const lectureCards = document.querySelectorAll('.lecture-card');
    lectureCards.forEach(card => {
        card.addEventListener('click', function () {
            const lectureId = this.getAttribute('data-lecture');
            loadLecture(lectureId);
        });
    });
});

// PWA Installation
let deferredPrompt;

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register SW relative to current path so it works on /public/index.html during dev
        const swPath = 'sw.js';
        navigator.serviceWorker.register(swPath)
            .then((registration) => {
                console.log('SW registered: ', registration);

                // Check for service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is available
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((registrationError) => {
                console.log('SW registration failed for', swPath, registrationError);
                // Fallback to root path if first attempt fails
                navigator.serviceWorker.register('/sw.js').catch(err => {
                    console.log('SW registration failed for /sw.js as well:', err);
                });
            });
    });

    // Handle service worker updates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}

// Show update notification
function showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: Arial, sans-serif;
        max-width: 300px;
    `;

    notification.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>New version available!</strong>
        </div>
        <button id="update-btn" style="
            background: white;
            color: #4CAF50;
            border: none;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 10px;
        ">Update Now</button>
        <button id="dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
        ">Dismiss</button>
    `;

    document.body.appendChild(notification);

    // Handle update button click
    document.getElementById('update-btn').addEventListener('click', () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
    });

    // Handle dismiss button click
    document.getElementById('dismiss-btn').addEventListener('click', () => {
        notification.remove();
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show install button if it exists
    showInstallButton();
});

// Show install button when PWA can be installed
function showInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', installPWA);
    }
}

// Install PWA
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

// Check if app is already installed
function isPWAInstalled() {
    // Check display modes and a persistent flag
    const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = window.navigator.standalone === true;
    const installedFlag = localStorage.getItem('pwaInstalled') === 'true';
    return displayModeStandalone || iosStandalone || installedFlag;
}

// Show install prompt when app is launched
window.addEventListener('load', () => {
    if (!isPWAInstalled() && 'serviceWorker' in navigator) {
        // Respect previous dismissal for 7 days
        const dismissedAt = parseInt(localStorage.getItem('pwaPromptDismissedAt') || '0', 10);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const canShow = !dismissedAt || (Date.now() - dismissedAt > sevenDays);

        if (!canShow) return;

        // Show install prompt after a delay
        setTimeout(() => {
            if (deferredPrompt) {
                showInstallButton();
            } else {
                // Show custom install prompt if browser doesn't support beforeinstallprompt
                showCustomInstallPrompt();
            }
        }, 3000);
    }
});

// Show custom install prompt for browsers that don't support beforeinstallprompt
function isIOS() {
    return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function showCustomInstallPrompt() {
    const installPrompt = document.getElementById('pwa-install-prompt');
    if (installPrompt) {
        installPrompt.style.display = 'block';

        // Add event listeners for prompt actions
        const acceptBtn = document.getElementById('pwa-install-accept');
        acceptBtn.onclick = null;
        if (isIOS()) {
            // iOS does not support beforeinstallprompt, show instructions
            acceptBtn.addEventListener('click', () => {
                showInstallInstructions();
                dismissInstallPrompt();
            });
        } else if (deferredPrompt) {
            // Android/Windows with support → trigger real install
            acceptBtn.addEventListener('click', () => {
                installPWA();
                dismissInstallPrompt();
            });
        } else {
            // Fallback: show instructions
            acceptBtn.addEventListener('click', () => {
                showInstallInstructions();
                dismissInstallPrompt();
            });
        }
        document.getElementById('pwa-install-dismiss').addEventListener('click', dismissInstallPrompt);
    }
}

// Show manual install instructions
function showInstallInstructions() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #0c1122, #1a1f3a);
        color: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        max-width: 400px;
        text-align: center;
        border: 2px solid #667eea;
    `;
    notification.innerHTML = `
        <div style="margin-bottom: 20px;">
            <i class="fas fa-mobile-alt" style="font-size: 48px; color: #667eea; margin-bottom: 15px;"></i>
            <h3 style="margin: 0 0 15px 0; color: #fff;">Install ACS FRB 26</h3>
            <p style="margin: 0 0 20px 0; color: #b0b0b0; line-height: 1.5;">
                To install this app on your device:
            </p>
            <div style="text-align: left; margin-bottom: 20px;">
                <p style="margin: 10px 0;"><strong>Chrome/Edge:</strong> Click the install icon in address bar</p>
                <p style="margin: 10px 0;"><strong>Safari:</strong> Tap Share → Add to Home Screen</p>
                <p style="margin: 10px 0;"><strong>Firefox:</strong> Tap the menu → Install</p>
            </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-size: 14px; font-weight: 600;">
            Got it!
        </button>
    `;

    document.body.appendChild(notification);
}

// Dismiss install prompt
function dismissInstallPrompt() {
    const installPrompt = document.getElementById('pwa-install-prompt');
    if (installPrompt) {
        installPrompt.style.display = 'none';
    }
    // Remember dismissal time to avoid nagging the user
    localStorage.setItem('pwaPromptDismissedAt', String(Date.now()));
}

// When the PWA is installed, hide prompts and remember state
window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwaInstalled', 'true');
    const installButton = document.getElementById('install-button');
    if (installButton) installButton.style.display = 'none';
    const installPrompt = document.getElementById('pwa-install-prompt');
    if (installPrompt) installPrompt.style.display = 'none';
});

async function loadDynamicCounts() {
    try {
        // Load main videos data (FRB 25 archive)
        const response = await fetch('videos.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Load FRB 26 data if it exists
        try {
            const frb26Response = await fetch('frb26/videos.json');
            if (frb26Response.ok) {
                const frb26Data = await frb26Response.json();
                // Merge FRB 26 data into main data
                data.cycles.frb26 = frb26Data.cycles.frb26;
            }
        } catch (e) {
            console.log('FRB 26 videos not found, using main data only');
        }

        // Generate all cycles on home page
        if (window.location.pathname.includes('index') || window.location.pathname === '/' || window.location.pathname === '/index') {
            generateCycleCards(data);
        }

        // Generate chapters for specific cycle on chapters page
        if (window.location.pathname.includes('chapters')) {
            const urlParams = new URLSearchParams(window.location.search);
            const cycleId = urlParams.get('cycle') || 'frb25'; // Default to archive if no parameter
            console.log('Chapters page - Cycle ID from URL:', cycleId);
            console.log('Available cycles:', Object.keys(data.cycles));
            generateChapterCards(data, cycleId);
        }

        // Generate lectures for specific cycle and chapter on lectures page
        if (window.location.pathname.includes('lectures')) {
            const urlParams = new URLSearchParams(window.location.search);
            const cycleId = urlParams.get('cycle') || 'frb25'; // Default to archive if no parameter
            const chapterId = urlParams.get('chapter') || '1'; // Default to chapter 1 if no parameter
            generateLectureCards(data, cycleId, chapterId);
        }

    } catch (error) {
        console.error('Error loading dynamic counts:', error);

        // Show error message on the page
        const cyclesContainer = document.getElementById('cyclesContainer');
        if (cyclesContainer) {
            cyclesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ff6b6b; background: rgba(255,107,107,0.1); border-radius: 10px; margin: 20px;">
                    <h2>⚠️ Content Loading Error</h2>
                    <p>Failed to load content: ${error.message}</p>
                    <button onclick="location.reload()" style="
                        background: #4CAF50; 
                        color: white; 
                        border: none; 
                        padding: 12px 24px; 
                        border-radius: 5px; 
                        cursor: pointer;
                        font-size: 16px;
                        margin-top: 20px;
                    ">🔄 Refresh Page</button>
                    <br><br>
                    <p><small>If the problem persists, try:</small></p>
                    <ul style="text-align: left; display: inline-block; margin: 10px 0;">
                        <li>Hard refresh (Ctrl+F5)</li>
                        <li>Clear browser cache</li>
                        <li>Visit in incognito mode</li>
                    </ul>
                </div>
            `;
        }
    }
}

function generateCycleCards(data) {
    const cyclesContainer = document.getElementById('cyclesContainer');

    if (!cyclesContainer) {
        console.error('Cycles container not found.');
        return;
    }

    cyclesContainer.innerHTML = ''; // Clear existing cards

    // Sort cycles to show FRB 26 first, then Archive
    const cycleIds = Object.keys(data.cycles).sort((a, b) => {
        if (a === 'frb26') return -1;
        if (b === 'frb26') return 1;
        if (a === 'frb25') return -1;
        if (b === 'frb25') return 1;
        return parseInt(a) - parseInt(b);
    });

    cycleIds.forEach(cycleId => {
        const cycle = data.cycles[cycleId];
        const card = document.createElement('div');
        card.classList.add('chapter-card');
        card.setAttribute('data-chapter', cycleId);

        // Add special styling for coming soon items
        if (cycle.status === 'coming_soon') {
            card.classList.add('coming-soon');
        } else if (cycle.status === 'archive') {
            card.classList.add('archive');
        }

        // Calculate total chapters for this cycle
        const totalChapters = cycle.chaptersList.length;

        let overlayText = 'Click to View Subjects';
        if (cycle.status === 'coming_soon') {
            overlayText = 'Coming Soon';
        }

        card.innerHTML = `
            <div class="card-content">
                <div class="chemistry-icon">
                    <i class="${cycle.icon || 'fas fa-flask'}"></i>
                </div>
                <h2>${cycle.title}</h2>
                <div class="lecture-count">${totalChapters} Subject${totalChapters > 1 ? 's' : ''}</div>
                <div class="card-overlay">
                    <span>${overlayText}</span>
                </div>
            </div>
        `;

        // Add click event listener
        card.addEventListener('click', function () {
            const cycleId = this.getAttribute('data-chapter');
            const cycleData = data.cycles[cycleId];

            if (cycleData.status === 'coming_soon') {
                // Show coming soon message
                showComingSoonMessage();
                return;
            }

            console.log('Clicked cycle:', cycleId);
            // Navigate to chapters page with cycle parameter
            window.location.href = `chapters?cycle=${cycleId}`;
        });

        cyclesContainer.appendChild(card);
    });

    // Add "Our Other Subject Courses" card at the end
    addOtherSubjectsCard(cyclesContainer);
}

function addOtherSubjectsCard(container) {
    const card = document.createElement('div');
    card.classList.add('chapter-card', 'other-subjects-card');
    card.setAttribute('data-subject', 'other');

    card.innerHTML = `
        <div class="card-content">
            <div class="chemistry-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <h2>Our Other Subject Courses</h2>
            <div class="lecture-count">3 Subjects</div>
            <div class="card-overlay">
                <span>Click to View Subjects</span>
            </div>
        </div>
    `;

    // Add click event listener
    card.addEventListener('click', function () {
        toggleOtherSubjects(this);
    });

    container.appendChild(card);
}

function toggleOtherSubjects(card) {
    // Check if subjects are already shown
    const existingSubjects = card.querySelector('.other-subjects-expanded');

    if (existingSubjects) {
        // Remove existing subjects
        existingSubjects.remove();
        card.classList.remove('expanded');
        return;
    }

    // Create expanded subjects section
    const expandedSection = document.createElement('div');
    expandedSection.classList.add('other-subjects-expanded');

    expandedSection.innerHTML = `
        <div class="subjects-grid">
            <div class="subject-card" data-subject="physics">
                <div class="card-content">
                    <div class="chemistry-icon">
                        <i class="fas fa-atom"></i>
                    </div>
                    <h3>Physics</h3>
                    <div class="lecture-count">Available Now</div>
                </div>
            </div>
            <div class="subject-card" data-subject="chemistry">
                <div class="card-content">
                    <div class="chemistry-icon">
                        <i class="fas fa-flask"></i>
                    </div>
                    <h3>Chemistry</h3>
                    <div class="lecture-count">Available Now</div>
                </div>
            </div>
            <div class="subject-card" data-subject="ict">
                <div class="card-content">
                    <div class="chemistry-icon">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <h3>ICT</h3>
                    <div class="lecture-count">Available Now</div>
                </div>
            </div>
        </div>
    `;

    // Add click event listeners to subject cards
    const subjectCards = expandedSection.querySelectorAll('.subject-card');
    subjectCards.forEach(subjectCard => {
        subjectCard.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent event bubbling
            const subject = this.getAttribute('data-subject');
            handleSubjectClick(subject);
        });
    });

    // Insert inside the clicked card
    card.appendChild(expandedSection);
    card.classList.add('expanded');
}

function handleSubjectClick(subject) {
    switch (subject) {
        case 'physics':
            // Physics course URL
            window.open('https://physicsacs26.web.app/', '_blank');
            break;
        case 'chemistry':
            // Chemistry course URL
            window.open('https://chemistryacs26.web.app/', '_blank');
            break;
        case 'ict':
            // ICT course URL
            window.open('https://ict2k26.web.app/', '_blank');
            break;
        default:
            console.log('Unknown subject:', subject);
    }
}

// Function to calculate video duration using YouTube IFrame API
function calculateVideoDuration(videoUrl, lectureId) {
    const element = document.getElementById(`duration-${lectureId}`);

    // Add loading class for visual feedback
    if (element) {
        element.classList.add('loading');
        element.classList.remove('calculating');
    }

    if (!videoUrl || videoUrl === '') {
        if (element) {
            element.classList.remove('loading');
            element.textContent = 'No video';
        }
        return;
    }

    // Extract video ID from URL
    const videoId = getVideoIdFromUrl(videoUrl);
    if (!videoId) {
        const element = document.getElementById(`duration-${lectureId}`);
        if (element) element.textContent = 'Invalid URL';
        return;
    }

    // Check if YouTube API is loaded
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        // Wait for YouTube API to load
        setTimeout(() => {
            calculateVideoDuration(videoUrl, lectureId);
        }, 50);
        return;
    }

    // Create a temporary hidden iframe to get duration
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.id = `temp-player-${lectureId}`;
    document.body.appendChild(tempContainer);

    // Set a timeout to show a fallback message if calculation takes too long
    const timeoutId = setTimeout(() => {
        const element = document.getElementById(`duration-${lectureId}`);
        if (element && element.classList.contains('loading')) {
            element.classList.remove('loading');
            element.textContent = 'Duration: 1.5s';
        }
    }, 1500); // 1.5 second timeout

    // Create YouTube player instance
    try {
        const player = new YT.Player(`temp-player-${lectureId}`, {
            height: '1',
            width: '1',
            videoId: videoId,
            playerVars: {
                'modestbranding': 1,
                'showinfo': 0,
                'rel': 0,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'cc_load_policy': 0,
                'autoplay': 0,
                'origin': window.location.origin,
                'enablejsapi': 1
            },
            events: {
                'onReady': function (event) {
                    try {
                        // Clear the timeout since we got a response
                        clearTimeout(timeoutId);

                        const duration = event.target.getDuration();
                        if (duration && duration > 0) {
                            const formattedDuration = formatTime(duration);
                            const element = document.getElementById(`duration-${lectureId}`);
                            if (element) {
                                element.classList.remove('loading');
                                element.textContent = formattedDuration;
                            }
                        } else {
                            const element = document.getElementById(`duration-${lectureId}`);
                            if (element) {
                                element.classList.remove('loading');
                                element.textContent = 'Duration: Unknown';
                            }
                        }
                    } catch (error) {
                        console.log('Error getting duration:', error);
                        const element = document.getElementById(`duration-${lectureId}`);
                        if (element) {
                            element.classList.remove('loading');
                            element.textContent = 'Duration: Unknown';
                        }
                    }

                    // Clean up temporary player
                    setTimeout(() => {
                        try {
                            if (tempContainer.parentNode) {
                                tempContainer.parentNode.removeChild(tempContainer);
                            }
                        } catch (cleanupError) {
                            console.log('Cleanup error:', cleanupError);
                        }
                    }, 1000);
                },
                'onError': function (event) {
                    // Clear the timeout since we got a response
                    clearTimeout(timeoutId);

                    console.log('YouTube Player Error:', event.data);
                    let errorMessage = 'Duration unavailable';
                    if (event.data === 150 || event.data === 101) {
                        errorMessage = 'Private video';
                    } else if (event.data === 103) {
                        errorMessage = 'Age restricted';
                    }

                    const element = document.getElementById(`duration-${lectureId}`);
                    if (element) {
                        element.classList.remove('loading');
                        element.textContent = errorMessage;
                    }

                    // Clean up temporary player
                    setTimeout(() => {
                        try {
                            if (tempContainer.parentNode) {
                                tempContainer.parentNode.removeChild(tempContainer);
                            }
                        } catch (cleanupError) {
                            console.log('Cleanup error:', cleanupError);
                        }
                    }, 500);
                }
            }
        });
    } catch (error) {
        console.log('Error creating YouTube player:', error);
        const element = document.getElementById(`duration-${lectureId}`);
        if (element) element.textContent = 'Duration error';

        // Clean up
        try {
            if (tempContainer.parentNode) {
                tempContainer.parentNode.removeChild(tempContainer);
            }
        } catch (cleanupError) {
            console.log('Cleanup error:', cleanupError);
        }
    }
}

function getVideoIdFromUrl(url) {
    const regex = /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

function generateChapterCards(data, cycleId) {
    console.log('generateChapterCards called with cycleId:', cycleId);
    const cycle = data.cycles[cycleId];
    if (!cycle) {
        console.error(`Cycle ${cycleId} not found.`);
        console.log('Available cycles:', Object.keys(data.cycles));
        return;
    }

    // Update cycle title
    const cycleTitle = document.getElementById('cycleTitle');
    if (cycleTitle) {
        cycleTitle.textContent = `${cycle.title}: ${cycle.chaptersList.length > 1 ? 'Multiple Subjects' : 'Single Subject'}`;
    }

    const chaptersContainer = document.getElementById('chaptersContainer');
    if (!chaptersContainer) {
        console.error('Chapters container not found.');
        return;
    }

    chaptersContainer.innerHTML = ''; // Clear existing cards

    cycle.chaptersList.forEach((chapter, index) => {
        const card = document.createElement('div');
        card.classList.add('chapter-card');
        card.setAttribute('data-chapter', `${cycleId}-${chapter.id}`);

        // Add special styling for coming soon items
        if (chapter.status === 'coming_soon') {
            card.classList.add('coming-soon');
        }

        let overlayText = 'Click to View Lectures';
        if (chapter.status === 'coming_soon') {
            overlayText = 'Coming Soon';
        }

        card.innerHTML = `
            <div class="card-content">
                <div class="chemistry-icon">
                    <i class="${chapter.icon || 'fas fa-book'}"></i>
                </div>
                <h2>${chapter.title}</h2>
                <div class="lecture-count">${chapter.lectures.length} Lecture${chapter.lectures.length > 1 ? 's' : ''}</div>
                <div class="card-overlay">
                    <span>${overlayText}</span>
                </div>
            </div>
        `;

        // Add click event listener
        card.addEventListener('click', function () {
            if (chapter.status === 'coming_soon') {
                // Show coming soon message
                showComingSoonMessage();
                return;
            }

            const chapterId = this.getAttribute('data-chapter');
            // Navigate to lectures page with cycle and chapter info
            window.location.href = `lectures?cycle=${cycleId}&chapter=${chapter.id}`;
        });

        chaptersContainer.appendChild(card);
    });
}

async function generateLectureCards(data, cycleId, chapterId) {
    const cycle = data.cycles[cycleId];
    if (!cycle) {
        console.error(`Cycle ${cycleId} not found.`);
        return;
    }

    const chapter = cycle.chaptersList.find(c => c.id === parseInt(chapterId));
    if (!chapter) {
        console.error(`Chapter ${chapterId} not found in cycle ${cycleId}.`);
        return;
    }

    // Load slides data for FRB 26
    let slidesData = null;
    if (cycleId === 'frb26') {
        // Slides are now included in the main videos data
        slidesData = data;
    } else {
        try {
            const slidesResponse = await fetch('lecture-slides.json');
            if (slidesResponse.ok) {
                slidesData = await slidesResponse.json();
            }
        } catch (e) {
            console.log('Lecture slides not found');
        }
    }

    // Update chapter title
    const chapterTitle = document.getElementById('chapterTitle');
    if (chapterTitle) {
        chapterTitle.textContent = chapter.title;
    }

    const lecturesContainer = document.getElementById('lecturesContainer');
    if (!lecturesContainer) {
        console.error('Lectures container not found.');
        return;
    }

    lecturesContainer.innerHTML = ''; // Clear existing cards

    // Generate lecture cards
    chapter.lectures.forEach(lecture => {
        const card = document.createElement('div');
        card.classList.add('lecture-card');
        card.setAttribute('data-lecture', `${cycleId}-${chapterId}-${lecture.id}`);

        card.innerHTML = `
            <div class="card-content">
                <h3>${lecture.title}</h3>
                <div class="lecture-duration calculating" id="duration-${cycleId}-${chapterId}-${lecture.id}">Calculating...</div>
                <div class="card-overlay">
                    <span>Click to Watch</span>
                </div>
            </div>
        `;

        // Add click event listener
        card.addEventListener('click', function () {
            loadLecture(`${cycleId}-${chapterId}-${lecture.id}`);
        });

        lecturesContainer.appendChild(card);

        // Calculate and update duration for this lecture
        calculateVideoDuration(lecture.videoUrl, `${cycleId}-${chapterId}-${lecture.id}`);
    });

    // Add PDF Notes section at the end
    await addChapterNotesSection(cycleId, chapterId);
}

async function loadLecture(lectureId) {
    try {
        const response = await fetch('videos.json');
        const data = await response.json();

        // Parse the lecture ID to get cycle, chapter, and lecture numbers
        const parts = lectureId.split('-');
        const cycleId = parts[0];
        const chapterId = parts[1];
        const lectureNumber = parts[2];

        // Find the lecture in the JSON data
        const cycle = data.cycles[cycleId];
        if (!cycle) {
            console.error(`Cycle ${cycleId} not found.`);
            return;
        }

        const chapter = cycle.chaptersList.find(c => c.id === parseInt(chapterId));
        if (!chapter) {
            console.error(`Chapter ${chapterId} not found in cycle ${cycleId}.`);
            return;
        }

        const lecture = chapter.lectures.find(l => l.id === parseInt(lectureNumber));
        if (!lecture || !lecture.videoUrl) {
            alert('Video not available yet. Please check back later.');
            return;
        }

        // Navigate to video player page with lecture ID
        window.location.href = `video-player.html?id=${lecture.id}&cycle=${cycleId}&chapter=${chapterId}`;
    } catch (error) {
        console.error('Error loading lecture:', error);
        alert('Error loading lecture. Please try again.');
    }
}

async function addChapterNotesSection(cycleId, chapterId) {
    try {
        // Load appropriate notes data based on cycle
        let notesData = null;
        if (cycleId === 'frb26') {
            const notesResponse = await fetch('frb26/notes.json');
            if (notesResponse.ok) {
                notesData = await notesResponse.json();
            }
        } else {
            const notesResponse = await fetch('chapter-notes.json');
            if (notesResponse.ok) {
                notesData = await notesResponse.json();
            }
        }

        if (!notesData) {
            return; // No notes data available
        }

        // Check if notes should be shown
        if (!notesData.notesInfo.showNotes) {
            return; // Notes are disabled
        }

        const cycle = notesData.cycles[cycleId];
        if (!cycle || !cycle.chapters[chapterId]) {
            return; // No notes available for this chapter
        }

        const chapterNotes = cycle.chapters[chapterId].notes;

        // Create simple notes section
        const notesSection = document.createElement('div');
        notesSection.className = 'chapter-notes-section';
        notesSection.innerHTML = `
            <div class="notes-card" onclick="openChapterNotes('${cycleId}', '${chapterId}')">
                <div class="card-content">
                    <h3>Chapter Notes</h3>
                </div>
                <div class="card-overlay">
                    <span>Click to View Notes</span>
                </div>
            </div>
        `;

        // Add to the page
        const lecturesContainer = document.getElementById('lecturesContainer');
        if (lecturesContainer) {
            lecturesContainer.appendChild(notesSection);
        }

    } catch (error) {
        console.error('Error loading chapter notes:', error);
        // Don't show error to user if notes fail to load
    }
}

// Function to open chapter notes in new tab
function openChapterNotes(cycleId, chapterId) {
    // Open in new tab instead of new window
    window.open(
        `pdf-viewer?cycle=${cycleId}`,
        '_blank'
    );
}

// Function to show coming soon message
function showComingSoonMessage() {
    // Create coming soon notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 30px 40px;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
        max-width: 400px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
        <div style="margin-bottom: 20px;">
            <i class="fas fa-clock" style="font-size: 3rem; color: #fff; margin-bottom: 15px;"></i>
            <h2 style="margin: 0 0 10px 0; font-size: 1.5rem;">Coming Soon!</h2>
            <p style="margin: 0; font-size: 1rem; opacity: 0.9;">
                This content will be available from November 1, 2025. Stay tuned for updates!
            </p>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            Got it!
        </button>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.8); 
            }
            to { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1); 
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
        if (style.parentNode) {
            style.remove();
        }
    }, 5000);
} 