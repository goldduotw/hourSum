let startTime;
let accumulatedTime = parseFloat(localStorage.getItem('hourSum_total')) || 0;
let isRunning = localStorage.getItem('hourSum_isRunning') === 'true';
let intervalId;

const timerDisplay = document.getElementById('timer-display');
const decimalDisplay = document.getElementById('decimal-display');
const statusArea = document.getElementById('status-area');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pipBtn = document.getElementById('pip-btn');
const canvas = document.getElementById('pip-canvas');
const video = document.getElementById('pip-video');
const titleInput = document.getElementById('title-input');

function updateDisplay() {
    let currentSession = isRunning ? Date.now() - startTime : 0;
    let totalMs = accumulatedTime + currentSession;
    let totalSeconds = Math.floor(totalMs / 1000);
    
    let d = Math.floor(totalSeconds / 86400);
    let h = Math.floor((totalSeconds % 86400) / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    const timeStr = `${String(d).padStart(2, '0')}d:${String(h).padStart(2, '0')}h:${String(m).padStart(2, '0')}m`;
    const decHours = (totalMs / 3600000).toFixed(2);
    
    timerDisplay.textContent = `${String(d).padStart(2, '0')}d : ${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m`;
    decimalDisplay.textContent = `${decHours} Total Hours`;

    if (isRunning) {
        statusArea.textContent = `Active: ${s}s`;
    } else {
        statusArea.textContent = "";
    }

    drawMiniCanvas(timeStr, decHours + 'h');
}

function drawMiniCanvas(time, decimal) {
    const ctx = canvas.getContext('2d');
    
    // Solid black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // LARGE Timer - Filling the top half
    ctx.fillStyle = '#4caf50';
    ctx.font = 'bold 44px monospace'; 
    ctx.textAlign = 'center';
    ctx.fillText(time, canvas.width / 2, canvas.height / 2 + 5);
    
    // LARGE Decimal - Filling the bottom half
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(decimal, canvas.width / 2, canvas.height / 2 + 55);
}

startBtn.addEventListener('click', () => {
    isRunning = true;
    startTime = Date.now();
    localStorage.setItem('hourSum_isRunning', 'true');
    localStorage.setItem('hourSum_startTime', startTime);
    intervalId = setInterval(updateDisplay, 1000);
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
});

pauseBtn.addEventListener('click', () => {
    isRunning = false;
    accumulatedTime += Date.now() - startTime;
    localStorage.setItem('hourSum_total', accumulatedTime);
    localStorage.setItem('hourSum_isRunning', 'false');
    clearInterval(intervalId);
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    startBtn.textContent = "RESUME";
    updateDisplay();
});

resetBtn.addEventListener('click', () => {
    if(confirm("Reset all hours?")) {
        clearInterval(intervalId);
        accumulatedTime = 0;
        isRunning = false;
        localStorage.clear();
        updateDisplay();
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        startBtn.textContent = "START";
    }
});

pipBtn.addEventListener('click', async () => {
    try {
        const originalTitle = document.title;
        document.title = titleInput.value;
        
        video.srcObject = canvas.captureStream(30);
        await video.play();
        await video.requestPictureInPicture();
        
        setTimeout(() => { document.title = originalTitle; }, 3000);
    } catch (e) {
        console.error("PiP Error: ", e);
    }
});

if (isRunning) {
    startTime = parseInt(localStorage.getItem('hourSum_startTime'));
    intervalId = setInterval(updateDisplay, 1000);
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
}
updateDisplay();