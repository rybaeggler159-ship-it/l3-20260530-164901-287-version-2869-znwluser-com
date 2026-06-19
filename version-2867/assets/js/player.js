(function () {
  function initPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var message = box.querySelector('.player-message');
    var stream = box.getAttribute('data-stream');
    var hls = null;
    var attached = false;
    var ready = false;

    function setError() {
      box.classList.add('player-error');
      if (message) {
        message.textContent = '播放暂时不可用，请稍后再试';
      }
    }

    function attachStream(callback) {
      if (ready) {
        callback();
        return;
      }

      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        callback();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(stream);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          callback();
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setError();
          }
        });

        return;
      }

      setError();
    }

    function playVideo() {
      attachStream(function () {
        box.classList.add('is-playing');
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        box.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initPlayer);
})();
