(function () {
    window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var loaded = false;
        var hls = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        function bindStream() {
            if (loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            loaded = true;
        }

        function startPlay() {
            bindStream();
            button.classList.add("is-hidden");
            video.controls = true;

            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", startPlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlay();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };
})();
