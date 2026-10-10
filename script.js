const uzbekWords = [
    "dastur", "kompyuter", "sayt", "tezlik", "klaviatura", "oqim", "bilim", "kelajak", 
    "hayot", "vaqt", "ish", "oila", "maktab", "talaba", "universitet", "muvaffaqiyat", 
    "maqsad", "reja", "fikr", "ijod", "dizayn", "texnologiya", "internet", "tarmoq", 
    "axborot", "xavfsizlik", "kod", "dasturchi", "mashq", "harakat", "kuch", "sabr", 
    "tajriba", "foyda", "qurilma", "ekran", "sichqoncha", "darcha", "ilovalar", "matn"
];

let words = [];
let timeLimit = 60; // Dastlabki standart 1 daqiqa (60 soniya)
let timeLeft = 60;
let timer = null;
let isStarted = false;
let currentMode = 'random'; // 'random' yoki 'custom'
let customTextValue = "";

let wordIndex = 0;
let letterIndex = 0;
let correctChars = 0;
let incorrectChars = 0;
let totalTyped = 0;

const wordDisplay = document.getElementById('word-display');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const modeRandomBtn = document.getElementById('mode-random');
const modeCustomBtn = document.getElementById('mode-custom');
const customContainer = document.getElementById('custom-container');
const customInput = document.getElementById('custom-input');
const startCustomBtn = document.getElementById('start-custom-btn');
const typingSection = document.getElementById('typing-section');
const resultScreen = document.getElementById('result-screen');
const resWpm = document.getElementById('res-wpm');
const resAcc = document.getElementById('res-acc');
const resErr = document.getElementById('res-err');
const playAgainBtn = document.getElementById('play-again-btn');
const timeBtns = document.querySelectorAll('.time-btn');

function initGame() {
    clearInterval(timer);
    isStarted = false;
    timeLeft = timeLimit;
    timerDisplay.textContent = timeLeft;
    wordIndex = 0;
    letterIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    totalTyped = 0;

    resultScreen.classList.add('hidden');
    typingSection.style.display = 'block';

    if (currentMode === 'random') {
        generateRandomWords();
    } else {
        generateCustomWords();
    }
    renderWords();
}

function generateRandomWords() {
    words = [];
    for (let i = 0; i < 60; i++) {
        const randomIndex = Math.floor(Math.random() * uzbekWords.length);
        words.push(uzbekWords[randomIndex]);
    }
}

function generateCustomWords() {
    const text = customTextValue.trim() || "Salom joqqizaptiriqi saytiga xush kelibsiz. Tez yozishni mashq qiling.";
    words = text.split(/\s+/);
}

function renderWords() {
    wordDisplay.innerHTML = '';
    words.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        if (wIdx === 0) wordSpan.classList.add('current');

        for (let lIdx = 0; lIdx < word.length; lIdx++) {
            const letterSpan = document.createElement('span');
            letterSpan.classList.add('letter');
            letterSpan.textContent = word[lIdx];
            if (wIdx === 0 && lIdx === 0) {
                letterSpan.classList.add('current-cursor');
            }
            wordSpan.appendChild(letterSpan);
        }
        wordDisplay.appendChild(wordSpan);
    });
}

function startTimer() {
    if (isStarted) return;
    isStarted = true;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

document.addEventListener('keydown', (e) => {
    if (resultScreen.classList.contains('hidden') === false) return;
    if (document.activeElement === customInput) return;

    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
        if (!isStarted && e.key.length === 1) {
            startTimer();
        }
        handleTyping(e);
    }
});

function handleTyping(e) {
    const wordElements = wordDisplay.querySelectorAll('.word');
    if (wordIndex >= words.length) return;

    let currentWordEl = wordElements[wordIndex];
    const letterElements = currentWordEl.querySelectorAll('.letter');

    // Bo'sh joy (Space) bosilganda
    if (e.key === ' ') {
        e.preventDefault();
        if (letterIndex > 0 || wordIndex > 0) {
            currentWordEl.classList.remove('current');
            for (let i = letterIndex; i < letterElements.length; i++) {
                letterElements[i].classList.add('incorrect');
            }
            wordIndex++;
            letterIndex = 0;
            if (wordIndex < words.length) {
                wordElements[wordIndex].classList.add('current');
                updateCursor();
            } else {
                endGame();
            }
        }
        return;
    }

    // Backspace bosilganda
    if (e.key === 'Backspace') {
        e.preventDefault();
        if (letterIndex > 0) {
            letterIndex--;
            const targetLetter = letterElements[letterIndex];
            targetLetter.classList.remove('correct', 'incorrect', 'extra');
            updateCursor();
        } else if (wordIndex > 0) {
            wordElements[wordIndex].classList.remove('current');
            wordIndex--;
            currentWordEl = wordElements[wordIndex];
            const prevLetters = currentWordEl.querySelectorAll('.letter');
            letterIndex = prevLetters.length;
            wordElements[wordIndex].classList.add('current');
            updateCursor();
        }
        return;
    }

    // Harf bosilganda
    if (e.key.length === 1) {
        totalTyped++;
        if (letterIndex < letterElements.length) {
            const targetLetter = letterElements[letterIndex];
            if (e.key === targetLetter.textContent) {
                targetLetter.classList.add('correct');
                correctChars++;
            } else {
                targetLetter.classList.add('incorrect');
                incorrectChars++;
            }
            letterIndex++;
            updateCursor();
        } else {
            const extraSpan = document.createElement('span');
            extraSpan.classList.add('letter', 'extra');
            extraSpan.textContent = e.key;
            currentWordEl.appendChild(extraSpan);
            letterIndex++;
            incorrectChars++;
            updateCursor();
        }
    }
}

function updateCursor() {
    const wordElements = wordDisplay.querySelectorAll('.word');
    document.querySelectorAll('.letter').forEach(l => {
        l.classList.remove('current-cursor', 'current-cursor-end');
    });

    if (wordIndex < wordElements.length) {
        const currentWordEl = wordElements[wordIndex];
        const letterElements = currentWordEl.querySelectorAll('.letter');

        if (letterIndex < letterElements.length) {
            letterElements[letterIndex].classList.add('current-cursor');
        } else if (letterElements.length > 0) {
            letterElements[letterElements.length - 1].classList.add('current-cursor-end');
        }
    }
}

function endGame() {
    clearInterval(timer);
    typingSection.style.display = 'none';
    resultScreen.classList.remove('hidden');

    const wpm = Math.round((correctChars / 5) / (timeLimit / 60));
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;

    resWpm.textContent = wpm >= 0 ? wpm : 0;
    resAcc.textContent = (accuracy >= 0 ? accuracy : 0) + '%';
    resErr.textContent = incorrectChars;
}

restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

modeRandomBtn.addEventListener('click', () => {
    currentMode = 'random';
    modeRandomBtn.classList.add('active');
    modeCustomBtn.classList.remove('active');
    customContainer.classList.add('hidden');
    initGame();
});

modeCustomBtn.addEventListener('click', () => {
    currentMode = 'custom';
    modeCustomBtn.classList.add('active');
    modeRandomBtn.classList.remove('active');
    customContainer.classList.remove('hidden');
});

startCustomBtn.addEventListener('click', () => {
    customTextValue = customInput.value;
    if (!customTextValue.trim()) {
        alert("Iltimos, matn kiriting!");
        return;
    }
    initGame();
});

timeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        timeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        timeLimit = parseInt(e.target.getAttribute('data-time')) * 60;
        initGame();
    });
});

initGame();