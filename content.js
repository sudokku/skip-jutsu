const observableMap = new Map();

const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            if (!mutation.target.classList.contains('vjs-hidden')) {
                mutation.target.click();
            }
        }
    });
});

const config = {
    attributes: true,
    attributeFilter: ['class']
}

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
