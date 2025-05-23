import levels from './level.js';
import showCountdownAnimation from './util.js';
import { saveUserData } from './util.js';
import showRegistrationModal from './registration.js';
import makeRequest from './request.js';


// Game elements
const textDisplay = document.getElementById('text-display');
const progressFill = document.getElementById('progress-fill');
const currentLevelElement = document.getElementById('current-level');
const timerElement = document.getElementById('timer');
const typingSpeedElement = document.getElementById('typing-speed');
const accuracyElement = document.getElementById('accuracy');
//const scoreElement = document.getElementById('score');
const levelProgressElement = document.getElementById('level-progress');
const completionModal = document.getElementById('completion-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
const viewLeaderboardButton = document.getElementById('view-leaderboard');
const playAgainButton = document.getElementById('play-again');
const closeLeaderboardButton = document.getElementById('close-leaderboard');
const backToResultsButton = document.getElementById('back-to-results');
const modalScore = document.getElementById('modal-score');
const modalSpeed = document.getElementById('modal-speed');
const modalAccuracy = document.getElementById('modal-accuracy');
const modalTime = document.getElementById('modal-time');
const levelCompletionModal = document.getElementById('level-completion-modal');
const nextLevelButton = document.getElementById('next-level');
const levelModalScore = document.getElementById('level-modal-score');
const levelModalSpeed = document.getElementById('level-modal-speed');
const levelModalAccuracy = document.getElementById('level-modal-accuracy');
const typingInput = document.getElementById('hidden-input');
const startGameBtn = document.getElementById('start-game');
const introPage = document.getElementById('intro-page');
const keyboard = document.querySelector(".keyboard-container");
const keys = keyboard.querySelectorAll(".key");


const level = levels[0]; // Level 1
let currentSentence = '';
let startTime = null;
let timerInterval = null;
let correctChars = 0;
let currentIndex = 0;
let totalTypedChars = 0;


function startLevel1() {
    resetGameUI();
    currentSentence = getRandomSentence();
    console.log('Sentence ', currentSentence);
    renderSentence(currentSentence);
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
    startTime = null;
    correctChars = 0;
    totalTypedChars = 0;

    currentLevelElement.textContent = '1';
    timerElement.textContent = `${level.timeLimit}s`;

    // Timer countdown
    let timeLeft = level.timeLimit;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            endLevel();
        }
    }, 1000);
}

function getRandomSentence() {
    const idx = Math.floor(Math.random() * level.words.length);
    return level.words[idx];
}

function renderSentence(sentence) {
    textDisplay.innerHTML = '';
    sentence.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.setAttribute('data-index', index);
        span.classList.add('word');
        textDisplay.appendChild(span);
    });
}


function resetGameUI() {
    clearInterval(timerInterval);
    progressFill.style.width = '0%';
    // scoreElement.textContent = '';
    typingSpeedElement.textContent = '';
    accuracyElement.textContent = '';
    clearKeyHighlights();
}

typingInput.addEventListener('input', () => {
    if (!startTime) startTime = new Date();

    const userInput = typingInput.value;
    totalTypedChars = userInput.length;

    const spans = textDisplay.querySelectorAll('span');

    correctChars = 0;
    spans.forEach((span, index) => {
        const typedChar = userInput[index];
        const expectedChar = currentSentence[index];

        span.classList.remove('correct', 'incorrect');

        if (typedChar == null) {
            span.innerText = expectedChar;
        } else if (typedChar === expectedChar) {
            span.classList.add('correct');
            correctChars++;
        } else {
            span.classList.add('incorrect');
        }
    });

    currentIndex = 0;
    for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === currentSentence[i]) {
            currentIndex++;
        } else {
            break; // stop at first incorrect character
        }
    }

    // Highlight next expected key on virtual keyboard
    highlightSuggestedKey();

    // Update accuracy and speed
    const accuracy = userInput.length === 0 ? 100 : Math.round((correctChars / userInput.length) * 100);
    accuracyElement.textContent = `${accuracy}%`;

    const elapsedTime = (new Date() - startTime) / 1000;
    const wordsTyped = userInput.trim().split(/\s+/).length;
    const speedWPM = elapsedTime > 0 ? Math.round((wordsTyped / elapsedTime) * 60) : 0;
    typingSpeedElement.textContent = `${speedWPM} WPM`;

    progressFill.style.width = `${Math.min((userInput.length / currentSentence.length) * 100, 100)}%`;

    if (userInput === currentSentence) {
        endLevel();
    }
});

function highlightSuggestedKey() {
    clearKeyHighlights();

    if (currentIndex < currentSentence.length) {
        const nextChar = currentSentence[currentIndex];
        const upperChar = nextChar.toUpperCase();

        // Handle space or special characters separately if needed
        const nextKey = [...keys].find(k =>
            k.textContent.trim().toUpperCase() === upperChar ||
            k.dataset.key === `Key${upperChar}` ||
            (nextChar === ' ' && k.dataset.key === 'Space')
        );

        if (nextKey) nextKey.classList.add("key-suggest");
    }
}

function clearKeyHighlights() {
    keys.forEach(key => {
        key.classList.remove("key-pressed", "key-correct", "key-wrong", "key-suggest");
    });
}

document.addEventListener("keydown", (e) => {
    clearKeyHighlights();
    const keyElement = [...keys].find(k => k.dataset.key === e.code);
    if (keyElement) keyElement.classList.add("key-pressed");

    // Optionally re-highlight next suggested key
    highlightSuggestedKey();
});


function endLevel() {
    clearInterval(timerInterval);
    typingInput.disabled = true;

    const timeTaken = (new Date() - startTime) / 1000; // in seconds
    const wordsTyped = currentSentence.trim().split(/\s+/).length;
    const speedWPM = Math.round((wordsTyped / timeTaken) * 60);
    const accuracy = Math.round((correctChars / currentSentence.length) * 100);
    const score = Math.round(speedWPM * (accuracy / 100));

    typingSpeedElement.textContent = `${speedWPM} WPM`;
    accuracyElement.textContent = `${accuracy}%`;
    // scoreElement.textContent = score;

    // Optional: Show completion modal or level up
    completionModal.style.display = 'block';
}

// Optional buttons
playAgainButton.addEventListener('click', () => {
    completionModal.style.display = 'none';
    startLevel1();
});

startGameBtn.addEventListener('click', () => {
    introPage.classList.add('hidden');
    startLevel1();
});
