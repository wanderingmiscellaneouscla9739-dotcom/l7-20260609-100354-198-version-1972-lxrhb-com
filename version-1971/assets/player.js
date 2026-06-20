(function () {
    window.setupPlayer = function (sourceUrl) {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.querySelector('[data-player-video]');
        var poster = document.querySelector('[data-player-poster]');
        var controls = document.querySelector('[data-player-controls]');
        var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-play]'));
        var muteButton = document.querySelector('[data-player-mute]');
        var fullButton = document.querySelector('[data-player-full]');
        var loaded = false;
        var hls = null;

        if (!shell || !video || !sourceUrl) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hls = null;
                    }
                });
            }
        }

        function updatePlayText() {
            playButtons.forEach(function (button) {
                button.textContent = video.paused ? '▶' : 'Ⅱ';
                button.setAttribute('aria-label', video.paused ? '播放' : '暂停');
            });
        }

        function startPlayback() {
            loadSource();

            if (poster) {
                poster.classList.add('is-hidden');
            }

            if (controls) {
                controls.classList.add('is-visible');
            }

            video.controls = true;
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (controls) {
                        controls.classList.add('is-visible');
                    }
                });
            }
        }

        function togglePlayback() {
            if (!loaded || video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        }

        playButtons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                togglePlayback();
            });
        });

        if (poster) {
            poster.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', togglePlayback);
        video.addEventListener('play', updatePlayText);
        video.addEventListener('pause', updatePlayText);
        video.addEventListener('ended', updatePlayText);

        if (muteButton) {
            muteButton.addEventListener('click', function (event) {
                event.stopPropagation();
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '静音' : '音量';
            });
        }

        if (fullButton) {
            fullButton.addEventListener('click', function (event) {
                event.stopPropagation();

                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (shell.requestFullscreen) {
                    shell.requestFullscreen();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });

        updatePlayText();
    };
})();
