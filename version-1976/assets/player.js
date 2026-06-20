(function () {
  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function startPlayer(box) {
    var video = box.querySelector("video");
    var stream = video ? video.getAttribute("data-stream") : "";

    if (!video || !stream) {
      return;
    }

    if (box.getAttribute("data-ready") === "1") {
      video.play().catch(function () {});
      box.classList.add("started");
      return;
    }

    box.setAttribute("data-ready", "1");
    box.classList.add("started");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.play().catch(function () {});
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = stream;
        video.play().catch(function () {});
      }
    }).catch(function () {
      video.src = stream;
      video.play().catch(function () {});
    });
  }

  function bind() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    boxes.forEach(function (box) {
      var button = box.querySelector(".play-trigger");
      var video = box.querySelector("video");

      if (button) {
        button.addEventListener("click", function () {
          startPlayer(box);
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          startPlayer(box);
        });
        video.addEventListener("play", function () {
          box.classList.add("started");
        });
      }
    });
  }

  if (document.readyState !== "loading") {
    bind();
  } else {
    document.addEventListener("DOMContentLoaded", bind);
  }
})();
