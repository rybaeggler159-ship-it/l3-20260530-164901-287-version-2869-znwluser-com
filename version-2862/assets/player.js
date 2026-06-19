import { H as Hls } from './hls-vendor-dru42stk.js';

const video = document.querySelector('[data-hls]');
const trigger = document.querySelector('[data-play-trigger]');
let hlsInstance = null;
let hasStarted = false;

function hideTrigger() {
  if (trigger) {
    trigger.classList.add('is-hidden');
  }
}

function showMessage(message) {
  if (!trigger) {
    return;
  }
  trigger.classList.remove('is-hidden');
  const strong = trigger.querySelector('strong');
  const em = trigger.querySelector('em');
  if (strong) {
    strong.textContent = '播放提示';
  }
  if (em) {
    em.textContent = message;
  }
}

async function startPlayer() {
  if (!video || hasStarted) {
    if (video) {
      await video.play().catch(function () {});
    }
    return;
  }

  hasStarted = true;
  const source = video.dataset.hls;

  try {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      showMessage('当前浏览器暂不支持 HLS 播放，请更换支持 HLS 的浏览器。');
      hasStarted = false;
      return;
    }

    hideTrigger();
    await video.play();
  } catch (error) {
    showMessage('播放源初始化失败，请检查网络或 m3u8 源是否可访问。');
    hasStarted = false;
    console.error(error);
  }
}

if (trigger) {
  trigger.addEventListener('click', startPlayer);
}

if (video) {
  video.addEventListener('play', hideTrigger);
  video.addEventListener('error', function () {
    showMessage('播放器收到错误事件，请检查播放源。');
  });
}

window.addEventListener('beforeunload', function () {
  if (hlsInstance) {
    hlsInstance.destroy();
  }
});
