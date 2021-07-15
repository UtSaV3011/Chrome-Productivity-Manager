chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(["blocked", "enabled"], function (local) {
    if (!Array.isArray(local.blocked)) {
      chrome.storage.local.set({ blocked: [] });
    }

    if (typeof local.enabled !== "boolean") {
      chrome.storage.local.set({ enabled: false });
    }
  });

});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  const url = changeInfo.pendingUrl || changeInfo.url;
  if (!url || !url.startsWith("http")) {
    return;
  }

  const hostname = new URL(url).hostname;

  chrome.storage.local.get(["blocked", "enabled"], function (local) {
    const { blocked, enabled } = local;
    if (Array.isArray(blocked) && enabled && blocked.find(domain => hostname.includes(domain))) {
      chrome.tabs.remove(tabId);
    }
  });
});
let elap = 0;
let hr = 0;
let min = 0;
let seconds = 0;
let elap1 = 0;
let setInterval1;
let hour, minu, sec, time, timrzinterval;

chrome.runtime.onMessage.addListener((message) => {
  if (message.cmd === 'START_TIMER') {
    chrome.storage.local.set({ timerStarted: true });
    setInterval1 = setInterval(update1, 1000);
    function update1() {
      hr = parseInt(hr);
      min = parseInt(min);
      elap1 += 1;
      seconds = elap1 - elap;
      const blocktime = message.timeToRun;
      if (hr * 60 * 60 + min * 60 + seconds == blocktime * 60) {
        elap = 0;
        hr = 0;
        min = 0;
        seconds = 0;
        elap1 = 0;
        chrome.runtime.sendMessage({ cmd: 'response', data: { hr: 00, min: 00, sec: 00 } });
        chrome.storage.local.set({ timerStarted: false });
        clearInterval(setInterval1);
        chrome.webRequest.onBeforeRequest.addListener(
          function(info, sender, reply){
           const timeout = setTimeout(() => {
              chrome.webRequest.onBeforeRequest.removeListener(arguments.callee);
              clearTimeout(timeout);
            }, 20000)
            return { cancel: true };
          },
          {
            urls: [
              "https://*/*", "http://*/*"
            ],
          },
          ['blocking']
        );
        }

      if (seconds == 60) {
        seconds = 0;
        min += 1;
        elap1 = 0;
      }
      if (min == 60) {
        hr += 1;
        min = 0;
      }
      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      if (min < 10) {
        min = '0' + min;
      }
      if (hr < 10) {
        hr = '0' + hr;
      }
      chrome.runtime.sendMessage({ cmd: 'response', data: { hr: hr, min: min, sec: seconds } })
    }
  }

  if (message.cmd === 'START_ALARM') {
    chrome.storage.local.set({ alarmStarted: true });
    time = message.starting * 60;
    timrzinterval = setInterval(update, 1000);
    function update() {
      hour = Math.floor((time / 60) / 60);
      minu = Math.floor(time / 60) - hour * 60;
      sec = time % 60;
      if (sec < 10) {
        sec = '0' + sec;
      }
      if (minu < 10) {
        minu = '0' + minu;
      }
      if (hour < 10) {
        hour = '0' + hour;
      }

      if (hour == 0 && minu == 0 && sec == 0) {
        clearInterval(timrzinterval);
        chrome.storage.local.set({ alarmStarted: false });
        chrome.runtime.sendMessage({cmd: 'playAlarm'});
      }
      time--;
      chrome.runtime.sendMessage({ cmd: 'alarmResponse', data: { hr: hour, min: minu, sec: sec } })
    }
  }
});