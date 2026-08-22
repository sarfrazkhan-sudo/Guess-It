// ============================================
// AD TEST MODE
// ============================================
window.adsbygoogle = window.adsbygoogle || [];

function enableTestAds() {
    try {
        (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-1956830239755898",
            enable_page_level_ads: true
        });
        console.log('✅ AdMob test mode enabled');
    } catch(e) {
        console.log('⚠️ AdMob error:', e);
    }
}
enableTestAds();

// ============================================
// ADMOB - REFRESH ADS
// ============================================
function refreshAds() {
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
        console.log('✅ Ads refreshed');
    } catch(e) {
        console.log('⚠️ Ad refresh error:', e);
    }
}

// ============================================
// GAME STATE
// ============================================
const state = {
    p1Name: 'Player 1',
    p2Name: 'Player 2',
    p1Secret: null,
    p2Secret: null,
    currentPlayer: 1,
    p1Attempts: 0,
    p2Attempts: 0,
    p1Wins: 0,
    p2Wins: 0,
    maxAttempts: 10,
    maxRange: 100,
    difficulty: 'medium',
    p1Guesses: [],
    p2Guesses: [],
    p1GuessHistory: [],
    p2GuessHistory: [],
    currentGuess: '',
    soundEnabled: true,
    volume: 50,
    isGameOver: false,
    // Hotspot mode flags
    isHotspotMode: false,
    hotspotSecretSent: false
};

// ============================================
// LOADING SCREEN
// ============================================
let loadingProgress = 0;
const loadingBar = document.getElementById('loadingBar');
const loadingText = document.getElementById('loadingText');

function startLoading() {
    loadingProgress = 0;
    const interval = setInterval(() => {
        loadingProgress += Math.random() * 15 + 5;
        if (loadingProgress >= 100) {
            loadingProgress = 100;
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.remove('active');
                document.getElementById('startScreen').classList.add('active');
            }, 300);
        }
        loadingBar.style.width = loadingProgress + '%';
        loadingText.textContent = loadingProgress < 30 ? 'Loading...' :
                                   loadingProgress < 60 ? 'Almost ready...' :
                                   loadingProgress < 90 ? 'Getting ready...' : 'Starting!';
    }, 150);
}

window.onload = startLoading;

// ============================================
// THEME
// ============================================
let isDark = true;

function toggleTheme() {
    isDark = !isDark;
    document.body.classList.toggle('light-mode', !isDark);
    document.getElementById('themeToggle').classList.toggle('active', !isDark);
}

// ============================================
// DIFFICULTY
// ============================================
function toggleDifficulty() {
    const popup = document.getElementById('diffPopup');
    const arrow = document.getElementById('diffArrow');
    popup.classList.toggle('open');
    arrow.classList.toggle('open');
}

function selectDifficulty(diff) {
    state.difficulty = diff;
    const labels = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' };
    const ranges = { easy: 50, medium: 100, hard: 200 };
    const attempts = { easy: 15, medium: 10, hard: 7 };
    
    document.getElementById('diffDisplay').textContent = labels[diff];
    state.maxRange = ranges[diff];
    state.maxAttempts = attempts[diff];
    
    document.querySelectorAll('.difficulty-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('diff' + diff.charAt(0).toUpperCase() + diff.slice(1)).classList.add('selected');
    
    document.getElementById('diffPopup').classList.remove('open');
    document.getElementById('diffArrow').classList.remove('open');
}

// ============================================
// SOUND
// ============================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function changeVolume(val) {
    state.volume = parseInt(val) / 100;
}

function playSound(type) {
    if (!state.soundEnabled) return;
    try {
        const ctx = getAudioContext();
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.value = state.volume * 0.5;

        if (type === 'click') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            osc.frequency.value = 600;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } 
        else if (type === 'correct') {
            const notes = [523, 659, 784];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(masterGain);
                osc.frequency.value = freq;
                osc.type = 'sine';
                const startTime = ctx.currentTime + i * 0.1;
                gain.gain.setValueAtTime(0.3, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
                osc.start(startTime);
                osc.stop(startTime + 0.15);
            });
        } 
        else if (type === 'high') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } 
        else if (type === 'low') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } 
        else if (type === 'win') {
            const melody = [523, 523, 523, 659, 784, 659, 784];
            const durations = [0.15, 0.15, 0.15, 0.2, 0.2, 0.2, 0.3];
            melody.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(masterGain);
                osc.frequency.value = freq;
                osc.type = 'square';
                const startTime = ctx.currentTime + i * 0.12;
                gain.gain.setValueAtTime(0.25, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + durations[i]);
                osc.start(startTime);
                osc.stop(startTime + durations[i]);
            });
        } 
        else if (type === 'error') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            osc.frequency.value = 150;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        }
        else if (type === 'back') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        }
    } catch(e) {
        console.log('Sound error:', e);
    }
}

// ============================================
// START GAME (Normal Mode)
// ============================================
function startGame() {
    state.p1Name = document.getElementById('player1Name').value.trim() || 'Player 1';
    state.p2Name = document.getElementById('player2Name').value.trim() || 'Player 2';
    state.isHotspotMode = false;
    playSound('click');
    
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('secretScreen').classList.add('active');
    document.getElementById('secretTitle1').textContent = state.p1Name + ': Set Secret Number';
    document.getElementById('secretRange1').textContent = state.maxRange;
    state.p1Secret = null;
    state.currentGuess = '';
    updateSecretDisplay1();
}

// ============================================
// SECRET 1 (Normal Mode)
// ============================================
function numPad1(val) {
    if (state.p1Secret !== null) return;
    playSound('click');
    if (val === 'delete') {
        state.currentGuess = state.currentGuess.slice(0, -1);
    } else if (state.currentGuess.length < 4) {
        state.currentGuess += val;
    }
    updateSecretDisplay1();
}

function updateSecretDisplay1() {
    const display = document.getElementById('secretDisplay1');
    if (state.currentGuess.length === 0) {
        display.innerHTML = '<span class="placeholder-text">Enter your secret number</span>';
    } else {
        const dots = '●'.repeat(state.currentGuess.length) + '⚪'.repeat(4 - state.currentGuess.length);
        display.textContent = dots;
    }
}

function confirmSecret1() {
    // Check if hotspot mode
    if (state.isHotspotMode) {
        confirmSecret1Hotspot();
        return;
    }
    
    const num = parseInt(state.currentGuess);
    if (!num || num < 1 || num > state.maxRange) {
        playSound('error');
        alert('Please enter a valid number between 1 and ' + state.maxRange);
        return;
    }
    state.p1Secret = num;
    playSound('correct');
    
    document.getElementById('secretScreen').classList.remove('active');
    document.getElementById('secretScreen2').classList.add('active');
    document.getElementById('secretTitle2').textContent = state.p2Name + ': Set Secret Number';
    document.getElementById('secretRange2').textContent = state.maxRange;
    state.p2Secret = null;
    state.currentGuess = '';
    updateSecretDisplay2();
}

// ============================================
// SECRET 2 (Normal Mode)
// ============================================
function numPad2(val) {
    if (state.p2Secret !== null) return;
    playSound('click');
    if (val === 'delete') {
        state.currentGuess = state.currentGuess.slice(0, -1);
    } else if (state.currentGuess.length < 4) {
        state.currentGuess += val;
    }
    updateSecretDisplay2();
}

function updateSecretDisplay2() {
    const display = document.getElementById('secretDisplay2');
    if (state.currentGuess.length === 0) {
        display.innerHTML = '<span class="placeholder-text">Enter your secret number</span>';
    } else {
        const dots = '●'.repeat(state.currentGuess.length) + '⚪'.repeat(4 - state.currentGuess.length);
        display.textContent = dots;
    }
}

function confirmSecret2() {
    const num = parseInt(state.currentGuess);
    if (!num || num < 1 || num > state.maxRange) {
        playSound('error');
        alert('Please enter a valid number between 1 and ' + state.maxRange);
        return;
    }
    state.p2Secret = num;
    playSound('correct');
    
    document.getElementById('secretScreen2').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    startRound();
}

// ============================================
// GAMEPLAY
// ============================================
function startRound() {
    state.currentPlayer = 1;
    state.p1Attempts = 0;
    state.p2Attempts = 0;
    state.p1Guesses = [];
    state.p2Guesses = [];
    state.p1GuessHistory = [];
    state.p2GuessHistory = [];
    state.isGameOver = false;
    state.currentGuess = '';
    state.hotspotSecretSent = false;
    updateGameUI();
    updateGuessDisplay();
    document.getElementById('hintBox').textContent = '💡 ' + state.p1Name + '\'s turn to guess';
    document.getElementById('hintBox').className = 'hint-box hint-empty';
    document.getElementById('historyBox').innerHTML = '<div class="history-empty">📜 No guesses yet</div>';
    updateScoreDisplay();
    refreshAds();
}

function updateGameUI() {
    const isP1 = state.currentPlayer === 1;
    const name = isP1 ? state.p1Name : state.p2Name;
    const target = isP1 ? state.p2Name : state.p1Name;
    const attempts = isP1 ? state.p1Attempts : state.p2Attempts;
    
    document.getElementById('turnPlayerName').textContent = name;
    document.getElementById('turnTargetLabel').textContent = 'Guessing ' + target + '\'s number';
    document.getElementById('attemptsText').innerHTML = attempts + ' / ' + state.maxAttempts;
    document.getElementById('maxAttemptsText').textContent = state.maxAttempts;
    
    const pct = (attempts / state.maxAttempts) * 100;
    document.getElementById('attemptsFill').style.width = Math.min(pct, 100) + '%';
}

function updateGuessDisplay() {
    const display = document.getElementById('guessDisplay');
    if (state.currentGuess.length === 0) {
        display.innerHTML = '<span class="placeholder-text">Enter your guess</span>';
    } else {
        const dots = '●'.repeat(state.currentGuess.length) + '⚪'.repeat(4 - state.currentGuess.length);
        display.textContent = dots;
    }
}

function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = state.p1Wins + '-' + state.p2Wins;
}

function numGuess(val) {
    if (state.isGameOver) return;
    playSound('click');
    if (val === 'delete') {
        state.currentGuess = state.currentGuess.slice(0, -1);
    } else if (state.currentGuess.length < 4) {
        state.currentGuess += val;
    }
    updateGuessDisplay();
}

// ============================================
// MAKE GUESS (With Draw System)
// ============================================
function makeGuess() {
    if (state.isGameOver) return;
    
    const num = parseInt(state.currentGuess);
    if (!num || num < 1 || num > state.maxRange) {
        playSound('error');
        alert('Please enter a valid number between 1 and ' + state.maxRange);
        return;
    }
    
    const isP1 = state.currentPlayer === 1;
    const secret = isP1 ? state.p2Secret : state.p1Secret;
    
    let hint = '';
    let hintClass = '';
    let isCorrect = false;
    
    if (num === secret) {
        hint = '🎉 CORRECT!';
        hintClass = 'hint-correct';
        isCorrect = true;
    } else if (num > secret) {
        hint = '⬆️ Too High!';
        hintClass = 'hint-high';
        playSound('high');
    } else {
        hint = '⬇️ Too Low!';
        hintClass = 'hint-low';
        playSound('low');
    }
    
    if (isP1) {
        state.p1Attempts++;
        state.p1GuessHistory.push({ guess: num, hint: hint });
    } else {
        state.p2Attempts++;
        state.p2GuessHistory.push({ guess: num, hint: hint });
    }
    
    const hintBox = document.getElementById('hintBox');
    hintBox.textContent = hint;
    hintBox.className = 'hint-box ' + hintClass;
    
    addHistory(isP1, num, hint);
    
    // Check if correct
    if (isCorrect) {
        if (isP1) {
            state.p1Wins++;
            showWinner(state.p1Name, state.p1Attempts);
        } else {
            state.p2Wins++;
            showWinner(state.p2Name, state.p2Attempts);
        }
        state.isGameOver = true;
        refreshAds();
        return;
    }
    
    // Check if both players finished
    if (state.p1Attempts >= state.maxAttempts && state.p2Attempts >= state.maxAttempts) {
        showDraw();
        state.isGameOver = true;
        refreshAds();
        return;
    }
    
    // Check if current player finished attempts
    const currentAttempts = isP1 ? state.p1Attempts : state.p2Attempts;
    if (currentAttempts >= state.maxAttempts) {
        state.currentPlayer = isP1 ? 2 : 1;
        state.currentGuess = '';
        updateGuessDisplay();
        updateGameUI();
        updateScoreDisplay();
        const nextPlayer = isP1 ? state.p2Name : state.p1Name;
        hintBox.textContent = '⏳ ' + nextPlayer + '\'s turn now!';
        hintBox.className = 'hint-box hint-empty';
        refreshAds();
        return;
    }
    
    // Switch turn
    state.currentPlayer = isP1 ? 2 : 1;
    state.currentGuess = '';
    updateGuessDisplay();
    updateGameUI();
    updateScoreDisplay();
    refreshAds();
}

// ============================================
// HISTORY
// ============================================
function addHistory(isP1, guess, hint) {
    const box = document.getElementById('historyBox');
    const emptyMsg = box.querySelector('.history-empty');
    if (emptyMsg) emptyMsg.remove();
    
    const entry = document.createElement('div');
    entry.className = 'history-item';
    const name = isP1 ? state.p1Name : state.p2Name;
    const hintClass = hint.includes('High') ? 'history-high' : hint.includes('Low') ? 'history-low' : 'history-correct';
    entry.innerHTML = `<span>${name}</span><span class="history-guess ${hintClass}">${guess} ${hint}</span>`;
    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;
}

// ============================================
// WINNER
// ============================================
function showWinner(name, attempts) {
    playSound('win');
    setTimeout(() => playSound('win'), 300);
    setTimeout(() => playSound('win'), 600);
    
    setTimeout(() => {
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('winnerScreen').classList.add('active');
        document.getElementById('winnerIcon').textContent = '🏆';
        document.getElementById('winnerTitle').textContent = 'Winner!';
        document.getElementById('winnerName').textContent = name + ' 🎉';
        document.getElementById('winnerStats').textContent = 'Guessed correctly in ' + attempts + ' attempts!';
        updateScoreDisplay();
        refreshAds();
    }, 200);
}

// ============================================
// DRAW
// ============================================
function showDraw() {
    playSound('error');
    
    setTimeout(() => {
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('winnerScreen').classList.add('active');
        document.getElementById('winnerIcon').textContent = '🤝';
        document.getElementById('winnerTitle').textContent = "It's a Draw!";
        document.getElementById('winnerName').textContent = 'Both players';
        document.getElementById('winnerStats').textContent = 'No one guessed correctly! Better luck next time!';
        updateScoreDisplay();
        refreshAds();
    }, 300);
}
// ============================================
// REMATCH & NAVIGATION
// ============================================
function rematch() {
    playSound('click');
    document.getElementById('winnerScreen').classList.remove('active');
    document.getElementById('secretScreen').classList.add('active');
    document.getElementById('secretTitle1').textContent = state.p1Name + ': Set Secret Number';
    document.getElementById('secretRange1').textContent = state.maxRange;
    state.p1Secret = null;
    state.p2Secret = null;
    state.currentGuess = '';
    state.isGameOver = false;
    state.hotspotSecretSent = false;
    updateSecretDisplay1();
    refreshAds();
}

function goHome() {
    playSound('back');
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('startScreen').classList.add('active');
    state.isGameOver = false;
    state.hotspotSecretSent = false;
    refreshAds();
}

function goBackToSecret1() {
    playSound('back');
    document.getElementById('secretScreen2').classList.remove('active');
    document.getElementById('secretScreen').classList.add('active');
    state.p2Secret = null;
    state.currentGuess = '';
    updateSecretDisplay1();
}

function endGame() {
    if (confirm('End game and go home?')) {
        playSound('back');
        goHome();
    }
}

// ============================================
// HOW TO PLAY
// ============================================
function openHowToPlay() {
    playSound('click');
    document.getElementById('howToPlayModal').style.display = 'flex';
    document.getElementById('howToPlayModal').classList.add('active');
}

function closeHowToPlay() {
    playSound('back');
    document.getElementById('howToPlayModal').style.display = 'none';
    document.getElementById('howToPlayModal').classList.remove('active');
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('howToPlayModal');
    if (event.target === modal) {
        closeHowToPlay();
    }
});

// ============================================
// PREVENT KEYBOARD
// ============================================
document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type !== 'text') {
        e.target.blur();
    }
});

document.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });

// ============================================
// 📶 HOTSPOT / PEER-TO-PEER MULTIPLAYER
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================
let peer = null;
let connections = [];
let roomId = '';
let isHost = false;
let onlineGameStarted = false;
let mySecretNumber = null;
let opponentSecretNumber = null;

// ============================================
// OPEN HOTSPOT MODE
// ============================================
function openHotspotMode() {
    playSound('click');
    state.isHotspotMode = true;
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('hotspotScreen').classList.add('active');
    document.getElementById('hsP2Name').textContent = 'Waiting...';
    document.getElementById('hsP2Status').textContent = '⏳ Waiting';
    document.getElementById('hsP2Status').style.color = '#a7a9be';
    document.getElementById('hotspotRoomId').textContent = '----';
    document.getElementById('hotspotRoomInput').value = '';
    if (peer) { peer.destroy(); }
    connections = [];
    isHost = false;
}

// ============================================
// GENERATE ROOM ID
// ============================================
function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// ============================================
// CREATE ROOM (HOST)
// ============================================
function createHotspotRoom() {
    playSound('click');
    roomId = generateRoomId();
    document.getElementById('hotspotRoomId').textContent = roomId;
    document.getElementById('hotspotRoomInput').value = roomId;
    isHost = true;
    document.getElementById('hsP1Name').textContent = state.p1Name + ' (Host)';
    
    peer = new Peer(roomId);
    
    peer.on('open', function(id) {
        console.log('✅ Host created with ID:', id);
        alert('🎯 Room Created!\n\nRoom ID: ' + roomId + '\n\nShare this ID with Player 2 to join.');
    });
    
    peer.on('connection', function(conn) {
        console.log('✅ Player 2 connected!');
        connections.push(conn);
        document.getElementById('hsP2Name').textContent = state.p2Name + ' (Connected)';
        document.getElementById('hsP2Status').textContent = '✅ Connected';
        document.getElementById('hsP2Status').style.color = '#00ffc8';
        setupConnection(conn);
        playSound('correct');
    });
    
    peer.on('error', function(err) {
        console.log('❌ Peer error:', err);
        if (err.type === 'unavailable-id') {
            alert('⚠️ Room ID already taken. Please try again.');
            document.getElementById('hotspotRoomId').textContent = '----';
            isHost = false;
        }
    });
}

// ============================================
// JOIN ROOM (CLIENT)
// ============================================
function joinHotspotRoom() {
    playSound('click');
    const inputId = document.getElementById('hotspotRoomInput').value.trim().toUpperCase();
    if (!inputId) {
        alert('Please enter a Room ID');
        return;
    }
    roomId = inputId;
    document.getElementById('hotspotRoomId').textContent = roomId;
    isHost = false;
    document.getElementById('hsP1Name').textContent = state.p1Name + ' (Joining...)';
    
    peer = new Peer();
    
    peer.on('open', function(id) {
        console.log('✅ Client connected with ID:', id);
        let conn = peer.connect(roomId);
        connections.push(conn);
        document.getElementById('hsP2Name').textContent = state.p2Name + ' (Connected)';
        document.getElementById('hsP2Status').textContent = '✅ Connected';
        document.getElementById('hsP2Status').style.color = '#00ffc8';
        document.getElementById('hsP1Name').textContent = state.p1Name + ' (Player 1)';
        setupConnection(conn);
        playSound('correct');
    });
    
    peer.on('error', function(err) {
        console.log('❌ Peer error:', err);
        if (err.type === 'peer-unavailable') {
            alert('⚠️ Room not found. Please check the Room ID.');
        } else {
            alert('⚠️ Connection error: ' + err.message);
        }
    });
}

// ============================================
// SETUP DATA CONNECTION
// ============================================
function setupConnection(conn) {
    conn.on('data', function(data) {
        console.log('📩 Received:', data);
        handleOnlineData(data);
    });
    
    conn.on('close', function() {
        console.log('❌ Connection closed');
        document.getElementById('hsP2Status').textContent = '❌ Disconnected';
        document.getElementById('hsP2Status').style.color = '#FF6B6B';
        alert('⚠️ Other player disconnected!');
    });
}

// ============================================
// SEND DATA
// ============================================
function sendData(data) {
    if (connections.length > 0) {
        try {
            connections[0].send(data);
            console.log('📤 Sent:', data);
        } catch(e) {
            console.log('❌ Send error:', e);
        }
    } else {
        console.log('⚠️ No connections available');
    }
}

// ============================================
// HANDLE RECEIVED DATA
// ============================================
function handleOnlineData(data) {
    if (data.type === 'secret') {
        opponentSecretNumber = data.value;
        console.log('📥 Received opponent secret');
        if (isHost) {
            state.p2Secret = data.value;
        } else {
            state.p1Secret = data.value;
        }
        // Check if both secrets are set
        if ((isHost && state.p1Secret !== null && state.p2Secret !== null) ||
            (!isHost && state.p1Secret !== null && state.p2Secret !== null)) {
            startOnlineRound();
        }
    } 
    else if (data.type === 'guess') {
        console.log('📥 Received guess:', data.value);
        let isCorrect = (data.value === opponentSecretNumber);
        let hint = '';
        
        if (isCorrect) {
            hint = '🎉 Opponent guessed correctly!';
            if (isHost) {
                showOnlineWinner(state.p2Name);
            } else {
                showOnlineWinner(state.p1Name);
            }
        } else if (data.value > opponentSecretNumber) {
            hint = '⬆️ Opponent\'s guess was Too High!';
        } else {
            hint = '⬇️ Opponent\'s guess was Too Low!';
        }
        
        const hintBox = document.getElementById('hintBox');
        if (hintBox) {
            hintBox.textContent = hint;
            hintBox.className = 'hint-box ' + (isCorrect ? 'hint-correct' : hint.includes('High') ? 'hint-high' : 'hint-low');
        }
        
        if (isHost) {
            state.p2Attempts = data.attempts;
        } else {
            state.p1Attempts = data.attempts;
        }
        updateGameUI();
    }
    else if (data.type === 'game_start') {
        onlineGameStarted = true;
        startOnlineRound();
    }
    else if (data.type === 'turn_switch') {
        state.currentPlayer = data.player;
        updateGameUI();
        updateGuessDisplay();
        const hintBox = document.getElementById('hintBox');
        hintBox.textContent = '🎯 Your turn to guess!';
        hintBox.className = 'hint-box hint-empty';
    }
}

// ============================================
// START HOTSPOT GAME
// ============================================
function startHotspotGame() {
    if (connections.length === 0) {
        alert('⏳ Waiting for Player 2 to join...');
        return;
    }
    playSound('click');
    
    document.getElementById('hotspotScreen').classList.remove('active');
    document.getElementById('secretScreen').classList.add('active');
    document.getElementById('secretTitle1').textContent = state.p1Name + ': Set Secret Number';
    document.getElementById('secretRange1').textContent = state.maxRange;
    state.p1Secret = null;
    state.currentGuess = '';
    state.hotspotSecretSent = false;
    updateSecretDisplay1();
}

// ============================================
// HOTSPOT SECRET 1
// ============================================
function confirmSecret1Hotspot() {
    const num = parseInt(state.currentGuess);
    if (!num || num < 1 || num > state.maxRange) {
        playSound('error');
        alert('Please enter a valid number between 1 and ' + state.maxRange);
        return;
    }
    state.p1Secret = num;
    mySecretNumber = num;
    state.hotspotSecretSent = true;
    playSound('correct');
    
    // Send secret to opponent
    sendData({ 
        type: 'secret', 
        value: num 
    });
    
    document.getElementById('secretScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    // Check if opponent already sent secret
    if (state.p2Secret !== null) {
        startOnlineRound();
    } else {
        document.getElementById('hintBox').textContent = '⏳ Waiting for Player 2 to set secret...';
        document.getElementById('hintBox').className = 'hint-box hint-empty';
    }
}

// ============================================
// HOTSPOT SECRET 2
// ============================================
function confirmSecret2Hotspot() {
    const num = parseInt(state.currentGuess);
    if (!num || num < 1 || num > state.maxRange) {
        playSound('error');
        alert('Please enter a valid number between 1 and ' + state.maxRange);
        return;
    }
    state.p2Secret = num;
    mySecretNumber = num;
    state.hotspotSecretSent = true;
    playSound('correct');
    
    // Send secret to opponent
    sendData({ 
        type: 'secret', 
        value: num 
    });
    
    document.getElementById('secretScreen2').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    // Check if opponent already sent secret
    if (state.p1Secret !== null) {
        startOnlineRound();
    } else {
        document.getElementById('hintBox').textContent = '⏳ Waiting for Player 1 to set secret...';
        document.getElementById('hintBox').className = 'hint-box hint-empty';
    }
}

// ============================================
// OVERRIDE CONFIRM SECRET FOR HOTSPOT
// ============================================
const originalConfirmSecret1 = confirmSecret1;
const originalConfirmSecret2 = confirmSecret2;

// Update confirmSecret1 to handle hotspot mode
confirmSecret1 = function() {
    if (state.isHotspotMode) {
        const num = parseInt(state.currentGuess);
        if (!num || num < 1 || num > state.maxRange) {
            playSound('error');
            alert('Please enter a valid number between 1 and ' + state.maxRange);
            return;
        }
        state.p1Secret = num;
        mySecretNumber = num;
        state.hotspotSecretSent = true;
        playSound('correct');
        
        sendData({ type: 'secret', value: num });
        
        document.getElementById('secretScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        
        if (state.p2Secret !== null) {
            startOnlineRound();
        } else {
            document.getElementById('hintBox').textContent = '⏳ Waiting for Player 2 to set secret...';
            document.getElementById('hintBox').className = 'hint-box hint-empty';
        }
        return;
    }
    originalConfirmSecret1();
};

// Update confirmSecret2 to handle hotspot mode
confirmSecret2 = function() {
    if (state.isHotspotMode) {
        const num = parseInt(state.currentGuess);
        if (!num || num < 1 || num > state.maxRange) {
            playSound('error');
            alert('Please enter a valid number between 1 and ' + state.maxRange);
            return;
        }
        state.p2Secret = num;
        mySecretNumber = num;
        state.hotspotSecretSent = true;
        playSound('correct');
        
        sendData({ type: 'secret', value: num });
        
        document.getElementById('secretScreen2').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        
        if (state.p1Secret !== null) {
            startOnlineRound();
        } else {
            document.getElementById('hintBox').textContent = '⏳ Waiting for Player 1 to set secret...';
            document.getElementById('hintBox').className = 'hint-box hint-empty';
        }
        return;
    }
    originalConfirmSecret2();
};
// ============================================
// START ONLINE ROUND
// ============================================
function startOnlineRound() {
    // Wait for both secrets
    if (state.p1Secret === null || state.p2Secret === null) {
        return;
    }
    
    state.currentPlayer = 1;
    state.p1Attempts = 0;
    state.p2Attempts = 0;
    state.p1Guesses = [];
    state.p2Guesses = [];
    state.p1GuessHistory = [];
    state.p2GuessHistory = [];
    state.isGameOver = false;
    state.currentGuess = '';
    onlineGameStarted = true;
    
    updateGameUI();
    updateGuessDisplay();
    document.getElementById('hintBox').textContent = '🎯 Your turn to guess!';
    document.getElementById('hintBox').className = 'hint-box hint-empty';
    document.getElementById('historyBox').innerHTML = '<div class="history-empty">📜 No guesses yet</div>';
    updateScoreDisplay();
    refreshAds();
}

// ============================================
// OVERRIDE MAKE GUESS FOR HOTSPOT
// ============================================
const originalMakeGuess = makeGuess;

makeGuess = function() {
    if (state.isGameOver) return;
    
    // If in hotspot mode, use online logic
    if (state.isHotspotMode) {
        if (!onlineGameStarted) {
            alert('⏳ Waiting for opponent to set secret...');
            return;
        }
        
        const num = parseInt(state.currentGuess);
        if (!num || num < 1 || num > state.maxRange) {
            playSound('error');
            alert('Please enter a valid number between 1 and ' + state.maxRange);
            return;
        }
        
        const isP1 = state.currentPlayer === 1;
        const targetSecret = isP1 ? state.p2Secret : state.p1Secret;
        
        let hint = '';
        let hintClass = '';
        let isCorrect = false;
        
        if (num === targetSecret) {
            hint = '🎉 CORRECT!';
            hintClass = 'hint-correct';
            isCorrect = true;
        } else if (num > targetSecret) {
            hint = '⬆️ Too High!';
            hintClass = 'hint-high';
            playSound('high');
        } else {
            hint = '⬇️ Too Low!';
            hintClass = 'hint-low';
            playSound('low');
        }
        
        if (isP1) {
            state.p1Attempts++;
            state.p1GuessHistory.push({ guess: num, hint: hint });
        } else {
            state.p2Attempts++;
            state.p2GuessHistory.push({ guess: num, hint: hint });
        }
        
        const hintBox = document.getElementById('hintBox');
        hintBox.textContent = hint;
        hintBox.className = 'hint-box ' + hintClass;
        
        addHistory(isP1, num, hint);
        
        // Send guess to opponent
        sendData({ 
            type: 'guess', 
            value: num, 
            attempts: isP1 ? state.p1Attempts : state.p2Attempts 
        });
        
        if (isCorrect) {
            if (isP1) {
                state.p1Wins++;
                showOnlineWinner(state.p1Name);
            } else {
                state.p2Wins++;
                showOnlineWinner(state.p2Name);
            }
            state.isGameOver = true;
            return;
        }
        
        // Switch turn
        state.currentPlayer = isP1 ? 2 : 1;
        state.currentGuess = '';
        updateGuessDisplay();
        updateGameUI();
        updateScoreDisplay();
        
        // Notify opponent about turn switch
        sendData({ 
            type: 'turn_switch', 
            player: state.currentPlayer 
        });
        
        refreshAds();
        return;
    }
    
    // Normal mode
    originalMakeGuess();
};

// ============================================
// SHOW ONLINE WINNER
// ============================================
function showOnlineWinner(name) {
    playSound('win');
    setTimeout(() => playSound('win'), 300);
    setTimeout(() => playSound('win'), 600);
    
    setTimeout(() => {
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('winnerScreen').classList.add('active');
        document.getElementById('winnerIcon').textContent = '🏆';
        document.getElementById('winnerTitle').textContent = 'Winner!';
        document.getElementById('winnerName').textContent = name + ' 🎉';
        document.getElementById('winnerStats').textContent = 'You won the online match!';
        updateScoreDisplay();
        state.isGameOver = true;
        refreshAds();
    }, 200);
}