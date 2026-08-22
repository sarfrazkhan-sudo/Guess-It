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
    isGameOver: false
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
// START GAME
// ============================================
function startGame() {
    state.p1Name = document.getElementById('player1Name').value.trim() || 'Player 1';
    state.p2Name = document.getElementById('player2Name').value.trim() || 'Player 2';
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
// SECRET 1
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
// SECRET 2
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
    updateGameUI();
    updateGuessDisplay();
    document.getElementById('hintBox').textContent = '💡 ' + state.p1Name + '\'s turn to guess';
    document.getElementById('hintBox').className = 'hint-box hint-empty';
    document.getElementById('historyBox').innerHTML = '<div class="history-empty">📜 No guesses yet</div>';
    updateScoreDisplay();
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
// MAKE GUESS (FIXED - DRAW SYSTEM)
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
    
    // Track attempts and history
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
    
    // ==== CHECK: CORRECT GUESS =====
    if (isCorrect) {
        if (isP1) {
            state.p1Wins++;
            showWinner(state.p1Name, state.p1Attempts);
        } else {
            state.p2Wins++;
            showWinner(state.p2Name, state.p2Attempts);
        }
        state.isGameOver = true;
        return;
    }
    
    // ==== CHECK: BOTH PLAYERS FINISHED ALL ATTEMPTS =====
    if (state.p1Attempts >= state.maxAttempts && state.p2Attempts >= state.maxAttempts) {
        showDraw();
        state.isGameOver = true;
        return;
    }
    
    // ==== CHECK: CURRENT PLAYER FINISHED ATTEMPTS =====
    const currentAttempts = isP1 ? state.p1Attempts : state.p2Attempts;
    if (currentAttempts >= state.maxAttempts) {
        // Switch to other player
        state.currentPlayer = isP1 ? 2 : 1;
        state.currentGuess = '';
        updateGuessDisplay();
        updateGameUI();
        updateScoreDisplay();
        
        const nextPlayer = isP1 ? state.p2Name : state.p1Name;
        hintBox.textContent = '⏳ ' + nextPlayer + '\'s turn now!';
        hintBox.className = 'hint-box hint-empty';
        return;
    }
    
    // ==== SWITCH TURN (Normal) =====
    state.currentPlayer = isP1 ? 2 : 1;
    state.currentGuess = '';
    updateGuessDisplay();
    updateGameUI();
    updateScoreDisplay();
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
    updateSecretDisplay1();
}

function goHome() {
    playSound('back');
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('startScreen').classList.add('active');
    state.isGameOver = false;
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
