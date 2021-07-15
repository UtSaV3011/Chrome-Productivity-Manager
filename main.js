let newpage = document.getElementById('todoList');
newpage.addEventListener('click', openNewPage);
let newpage2 = document.getElementById('block');
let startCountDownBtn = document.getElementById('startCountdown');
let timrzinterval, time;
startCountDownBtn.addEventListener('click', startCountDown);
const countdown = document.getElementById('countdown');
let select = document.getElementById('timer');

function startCountDown() {
    if (timrzinterval) clearInterval(timrzinterval);
    const starting = document.getElementById('countdowntxt').value;
    document.getElementById('countdowntxt').value = "";
    chrome.storage.local.get("alarmStarted", function (local) {
        if (local && local.alarmStarted) {
            chrome.runtime.sendMessage({ cmd: 'UPDATE_ALARM' });
        } else {
            if(starting)
                chrome.runtime.sendMessage({ cmd: 'START_ALARM', starting:  starting});
        }
    });
}

function ringplay() {
    let audio = new Audio('https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3');
    audio.play();
    const ele = document.getElementById('hiddenBtn');
    ele.click();
}

function openNewPage() {
    let locationTab = window.location.href.replace('main', 'saveToDoList')
    chrome.tabs.create({ active: true, url: locationTab })
}

newpage2.addEventListener('click', () => {
    let localtab = window.location.href.replace('main', 'blocker')
    chrome.tabs.create({ active: true, url: localtab })
});


const timer = document.getElementById('settime');
const settimebtn = document.getElementById('settimebtn');
settimebtn.addEventListener('click', startTimer)

function startTimer() {
    chrome.storage.local.get("timerStarted", function (local) {
        if (local && local.timerStarted) {
            chrome.runtime.sendMessage({ cmd: 'UPDATE_TIMER' });
        } else {
            if(timer.value)
                chrome.runtime.sendMessage({ cmd: 'START_TIMER', timeToRun:  timer.value});
        }
    });
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.cmd === 'response') {
        const timeData = message.data;
        select.innerHTML = `${timeData.hr}:${timeData.min}:${timeData.sec}`;
    }
    if (message.cmd === 'alarmResponse') {
        const alarmData = message.data;
        countdown.innerHTML = `${alarmData.hr}:${alarmData.min}:${alarmData.sec}`;
    }
    if (message.cmd === 'playAlarm') {
        ringplay();
    }
});