(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var configNode = document.getElementById("player-config");

    if (!video || !cover || !configNode) {
      return;
    }

    var config = {};

    try {
      config = JSON.parse(configNode.textContent || "{}");
    } catch (error) {
      config = {};
    }

    var source = config.source || "";
    var poster = config.poster || "";
    var hls = null;
    var loaded = false;

    if (poster) {
      video.setAttribute("poster", poster);
    }

    function bindSource() {
      if (loaded || !source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 60,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function playVideo() {
      bindSource();
      cover.classList.add("is-hidden");
      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      cover.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
