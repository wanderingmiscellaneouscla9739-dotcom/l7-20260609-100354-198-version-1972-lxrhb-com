(function () {
  function startMoviePlayer(streamUrl) {
    var video = document.getElementById('movieVideo');
    var cover = document.querySelector('[data-player-cover]');
    var ready = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function prepareVideo() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
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

      ready = true;
    }

    function playVideo() {
      prepareVideo();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      video.controls = true;

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.startMoviePlayer = startMoviePlayer;
})();
