let skipIntro = document.querySelector('.vjs-overlay-bottom-left.vjs-overlay-skip-intro');
let playNext = document.querySelector('.vjs-overlay-bottom-right.vjs-overlay-skip-intro');

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

mutationObserver.observe(skipIntro, config);
mutationObserver.observe(playNext, config);