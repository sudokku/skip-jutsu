

const observableMap = new Map();

const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            if (!mutation.target.classList.contains('vjs-hidden')) {
                if (mutation.target.classList.contains('vjs-overlay-bottom-right')) {
                    chrome.storage.local.set({ 'playNext': true });
                }
                mutation.target.click();
            }
        }
    });
});

const config = {
    attributes: true,
    attributeFilter: ['class']
}

// HTTP-based communication with local server (more reliable than WebSocket in extensions)
function requestExternalFullscreen() {
    return new Promise((resolve, reject) => {
        try {
            console.log('🔌 Attempting to connect to fullscreen server via HTTP...');
            
            const message = {
                action: 'fullscreen',
                url: window.location.href,
                timestamp: Date.now()
            };
            
            console.log('📤 Sending fullscreen request:', message);
            
            // Use fetch with a timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                reject(new Error('Request timeout'));
            }, 3000);
            
            fetch('http://localhost:8765/fullscreen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
                signal: controller.signal
            })
            .then(response => {
                clearTimeout(timeoutId);
                if (response.ok) {
                    console.log('✅ HTTP request sent successfully');
                    resolve(true);
                } else {
                    console.log('❌ HTTP request failed:', response.status);
                    reject(new Error(`HTTP ${response.status}`));
                }
            })
            .catch(error => {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    console.log('⏰ HTTP request timeout');
                    reject(new Error('Request timeout'));
                } else {
                    console.log('❌ HTTP request error:', error);
                    reject(error);
                }
            });
            
        } catch (e) {
            console.log('💥 HTTP request exception:', e);
            reject(e);
        }
    });
}

// Wait for video player to be fully ready
function waitForVideoReady() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 10;

        const checkVideo = () => {
            const videoElement = document.querySelector('.vjs-tech');
            const playerElement = document.querySelector('.video-js');

            attempts++;
            console.log(`🔍 Checking video readiness (attempt ${attempts}/${maxAttempts})`);

            if (videoElement && playerElement && !playerElement.classList.contains('vjs-loading')) {
                console.log('✅ Video player is ready');
                resolve(videoElement);
            } else if (attempts < maxAttempts) {
                setTimeout(checkVideo, 500);
            } else {
                console.log('⚠️ Video readiness timeout, proceeding anyway');
                resolve(document.querySelector('.vjs-tech'));
            }
        };

        checkVideo();
    });
}

// Check if browser is actually in fullscreen
function isInFullscreen() {
    return !!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement);
}

// Enhanced fullscreen function with better timing and verification
async function attemptFullscreenAndPlay() {
    console.log('🎬 Starting fullscreen and play sequence...');

    // Wait for video to be ready
    const videoElement = await waitForVideoReady();
    if (!videoElement) {
        console.log('❌ Video element not found after waiting');
        return;
    }

    console.log('📺 Video element ready, proceeding with fullscreen...');

    try {
        // First, try to request external fullscreen (F11 via server)
        await requestExternalFullscreen();
        console.log('✅ External fullscreen request sent successfully');

        // Wait a bit longer for F11 to take effect
        console.log('⏳ Waiting for fullscreen to activate...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if fullscreen worked
        if (isInFullscreen()) {
            console.log('🎉 Browser is now in fullscreen mode!');
        } else {
            console.log('⚠️ F11 didn\'t activate fullscreen, trying browser API...');
            // Fallback: try browser fullscreen API
            try {
                await videoElement.requestFullscreen();
                console.log('✅ Browser API fullscreen succeeded');
            } catch (fullscreenError) {
                console.log('❌ Browser API fullscreen also failed:', fullscreenError);
            }
        }

    } catch (error) {
        console.log('⚠️ External fullscreen server not available:', error.message);
        console.log('🔄 Using fallback browser fullscreen...');

        // Fallback: try browser fullscreen API
        try {
            await videoElement.requestFullscreen();
            console.log('✅ Fallback: Browser fullscreen succeeded');
        } catch (fullscreenError) {
            console.log('❌ All fullscreen methods failed:', fullscreenError);
        }
    }

    // Always try to start video playback
    try {
        await videoElement.play();
        console.log('▶️ Video started playing');
    } catch (playError) {
        console.log('❌ Autoplay failed:', playError);
    }
}

// Check for pending fullscreen request
chrome.storage.local.get('playNext', (result) => {
    if (result.playNext) {
        chrome.storage.local.set({ 'playNext': false });
        console.log('🎯 Episode transition detected, starting fullscreen sequence...');
        // Increased delay to ensure page is fully loaded
        setTimeout(attemptFullscreenAndPlay, 2000);
    }
});

const checkLoadedInterval = setInterval(() => {
    let skipIntro = document.querySelector('.vjs-overlay-bottom-left.vjs-overlay-skip-intro');
    let playNext = document.querySelector('.vjs-overlay-bottom-right.vjs-overlay-skip-intro');

    if (skipIntro && !observableMap.has('skipIntro')) {
        observableMap.set('skipIntro', skipIntro);
        mutationObserver.observe(skipIntro, config);
        console.log('👀 Watching for skip intro button');
    }

    if (playNext && !observableMap.has('playNext')) {
        observableMap.set('playNext', playNext);
        mutationObserver.observe(playNext, config);
        console.log('👀 Watching for next episode button');
    }

    if (observableMap.has('skipIntro') && observableMap.has('playNext')) {
        clearInterval(checkLoadedInterval);
        console.log('✅ Skip Jutsu extension fully loaded and monitoring');
    }
}, 1000);

// Listen for manual fullscreen key combinations as fallback
document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+F as emergency fullscreen trigger
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        console.log('⌨️ Manual fullscreen trigger activated');
        attemptFullscreenAndPlay();
    }
});

console.log('🚀 Skip Jutsu extension loaded on:', window.location.href);
