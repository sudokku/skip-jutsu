

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

// Enhanced fullscreen function with multiple approaches
async function attemptFullscreenAndPlay() {
    let videoElement = document.querySelector('.vjs-tech');
    if (!videoElement) {
        console.log('Video element not found');
        return;
    }

    try {
        // Method 1: Try requesting fullscreen on video element
        await videoElement.requestFullscreen();
        console.log('Entered fullscreen mode via video element');

        // Start playing after successful fullscreen
        await videoElement.play();
        console.log('Video started playing');

    } catch (error) {
        console.log('Video fullscreen failed:', error);

        try {
            // Method 2: Try requesting fullscreen on document body
            await document.documentElement.requestFullscreen();
            console.log('Entered fullscreen mode via document');

            // Start playing
            await videoElement.play();
            console.log('Video started playing after document fullscreen');

        } catch (docError) {
            console.log('Document fullscreen failed:', docError);

            // Method 3: At least try to autoplay without fullscreen
            try {
                await videoElement.play();
                console.log('Video started playing (fullscreen failed)');
            } catch (playError) {
                console.log('Autoplay also failed:', playError);
            }
        }
    }
}

// Check for pending fullscreen request
chrome.storage.local.get('playNext', (result) => {
    if (result.playNext) {
        chrome.storage.local.set({ 'playNext': false });
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
    }

    if (playNext && !observableMap.has('playNext')) {
        observableMap.set('playNext', playNext);
        mutationObserver.observe(playNext, config);
    }

    if (observableMap.has('skipIntro') && observableMap.has('playNext')) {
        clearInterval(checkLoadedInterval);
    }
}, 1000);

// Listen for manual fullscreen key combinations as fallback
document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+F as emergency fullscreen trigger
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        attemptFullscreenAndPlay();
    }
});
