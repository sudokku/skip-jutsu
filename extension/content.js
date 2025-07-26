

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

// Enhanced fullscreen function with multiple approaches
async function attemptFullscreenAndPlay() {
    let videoElement = document.querySelector('.vjs-tech');
    if (!videoElement) {
        console.log('❌ Video element not found');
        return;
    }

    console.log('🎬 Starting fullscreen and play sequence...');

    try {
        // First, try to request external fullscreen (F11 via server)
        await requestExternalFullscreen();
        console.log('✅ External fullscreen request sent successfully');
    } catch (error) {
        console.log('⚠️ External fullscreen server not available:', error.message);
        console.log('🔄 Using fallback browser fullscreen...');
    }

    // Small delay to let F11 take effect, then handle video
    setTimeout(async () => {
        try {
            // Start playing the video
            await videoElement.play();
            console.log('▶️ Video started playing');
            
        } catch (playError) {
            console.log('❌ Autoplay failed:', playError);
            
            // Fallback: try browser fullscreen API
            try {
                await videoElement.requestFullscreen();
                await videoElement.play();
                console.log('✅ Fallback: Browser fullscreen + play succeeded');
            } catch (fullscreenError) {
                console.log('❌ All fullscreen methods failed:', fullscreenError);
            }
        }
    }, 500); // Increased delay to give F11 more time
}

// Check for pending fullscreen request
chrome.storage.local.get('playNext', (result) => {
    if (result.playNext) {
        chrome.storage.local.set({ 'playNext': false });
        console.log('🎯 Episode transition detected, starting fullscreen sequence...');
        // Add a small delay to ensure video is ready
        setTimeout(attemptFullscreenAndPlay, 500);
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
