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


let level = levels[0]; // Level 1
let currentSentence = '';
let startTime = null;
let timerInterval = null;
let correctChars = 0;
let currentIndex = 0;
let totalTypedChars = 0;
let fallingInterval = null;


function startLevel1() {
    resetGameUI();
    currentSentence = getRandomSentence(0);
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

function startLevel2() {
    resetGameUI();
    currentSentence = getRandomSentence(1);
    console.log('Level 2 Sentence:', currentSentence);
    renderSentence2(currentSentence); // This now adds scrolling animation
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
    startTime = null;
    correctChars = 0;
    totalTypedChars = 0;

    currentLevelElement.textContent = '2';
    timerElement.textContent = `${level.timeLimit}s`;

    let timeLeft = level.timeLimit;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            stopScrolling(); // Pause scroll
            endLevel();
        }
    }, 1000);
}

function startLevel3() {
    resetGameUI();
    currentSentence = getRandomSentence(2);
    console.log('Level 3 Sentence:', currentSentence);
    renderSentenceVertical(currentSentence);
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
    startTime = null;
    correctChars = 0;
    totalTypedChars = 0;

    currentLevelElement.textContent = '3';
    timerElement.textContent = `${level.timeLimit}s`;

    let timeLeft = level.timeLimit;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            endLevel();
        }
    }, 1000);
}

function startLevel4() {
    resetGameUI();

    currentSentence = getRandomSentence(3);
    const words = currentSentence.split(' ');
    let currentWordIndex = 0;

    typingInput.disabled = false;
    typingInput.value = '';
    typingInput.focus();

    currentLevelElement.textContent = '4';
    timerElement.textContent = `${level.timeLimit}s`;

    startTime = null;
    correctChars = 0;
    totalTypedChars = 0;

    let currentWord = '';
    let spans = [];

    function showWord(index) {
        if (index >= words.length) {
            endLevel();
            return;
        }

        currentWord = words[index];
        textDisplay.innerHTML = '';

        const wordSpanContainer = document.createElement('span');
        wordSpanContainer.className = 'word-container fade-in';

        spans = [];

        currentWord.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.setAttribute('data-index', i);
            span.classList.add('word');
            wordSpanContainer.appendChild(span);
            spans.push(span);
        });

        textDisplay.appendChild(wordSpanContainer);

        // Fade-out after 5 seconds, but do NOT auto-swap words here to avoid conflict
        setTimeout(() => {
            wordSpanContainer.classList.remove('fade-in');
            wordSpanContainer.classList.add('fade-out');
        }, 3000);
    }

    showWord(currentWordIndex);

    let timeLeft = level.timeLimit;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endLevel();
        }
    }, 1000);

    typingInput.oninput = () => {
        if (!startTime) startTime = new Date();

        const userInput = typingInput.value.trim();
        totalTypedChars++;

        correctChars = 0; // reset count each input

        spans.forEach((span, i) => {
            const typedChar = userInput[i];
            const expectedChar = currentWord[i];

            span.classList.remove('correct', 'incorrect');

            if (typedChar == null) return;

            if (typedChar === expectedChar) {
                span.classList.add('correct');
                correctChars++;
            } else {
                span.classList.add('incorrect');
            }
        });

        if (userInput === currentWord) {
            // Disable input while waiting to show next word
            typingInput.disabled = true;

            setTimeout(() => {
                currentWordIndex++;
                typingInput.value = '';
                typingInput.disabled = false;
                typingInput.focus();
                showWord(currentWordIndex);
                progressFill.style.width = `${(currentWordIndex / words.length) * 100}%`;
            }, 1000); // 1 second delay before showing next word
        }

        const accuracy = correctChars === 0 ? 100 : Math.round((correctChars / totalTypedChars) * 100);
        accuracyElement.textContent = `${accuracy}%`;

        const elapsedTime = (new Date() - startTime) / 1000;
        const wordsTyped = currentWordIndex;
        const speedWPM = elapsedTime > 0 ? Math.round((wordsTyped / elapsedTime) * 60) : 0;
        typingSpeedElement.textContent = `${speedWPM} WPM`;
    };
}



function stopScrolling() {
    const scrollSpan = document.querySelector('.scroll-text');
    if (scrollSpan) scrollSpan.style.animationPlayState = 'paused';
}


function getRandomSentence(index) {
    level = levels[index];
    const idx = Math.floor(Math.random() * level.words.length);
    return level.words[idx];
}

function startLevel5() {
    resetGameUI();
    currentSentence = getRandomSentence(4);
    console.log('Level 5 Sentence:', currentSentence);

    renderSentenceFalling(currentSentence);

    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();

    startTime = null;
    correctChars = 0;
    totalTypedChars = 0;

    currentLevelElement.textContent = '5';
    timerElement.textContent = `${levels[4].timeLimit}s`;

    let timeLeft = levels[4].timeLimit;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(fallingInterval);
            endLevel();
        }
    }, 1000);
}


function renderSentenceVertical(sentence) {
    textDisplay.innerHTML = '';

    const scrollingSpan = document.createElement('div');
    scrollingSpan.classList.add('scroll-text-vertical');
    scrollingSpan.style.animationDuration = '10s'; // Adjust based on sentence length if needed

    sentence.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.setAttribute('data-index', index);
        span.classList.add('word');
        scrollingSpan.appendChild(span);
    });

    textDisplay.appendChild(scrollingSpan);
}


function renderSentence2(sentence) {
    textDisplay.innerHTML = '';

    const scrollingSpan = document.createElement('div');
    scrollingSpan.classList.add('scroll-text');
    scrollingSpan.style.animationDuration = '15s'; // You can adjust based on sentence length

    sentence.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.setAttribute('data-index', index);
        span.classList.add('word');
        scrollingSpan.appendChild(span);
    });

    textDisplay.appendChild(scrollingSpan);
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
}

typingInput.addEventListener('input', () => {
    if (!startTime) startTime = new Date();

    // LEVEL 4 behaves differently
    if (currentLevelElement.textContent === '4') {
        // Handle word-by-word input logic here
        return;
    }

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


    scrollToSpan(currentIndex);

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

function scrollToSpan(index) {
    const spans = textDisplay.querySelectorAll('span');
    const container = document.getElementById("text-container");
    const targetSpan = spans[index];

    if (targetSpan) {
        const spanOffset = targetSpan.offsetLeft;
        const spanWidth = targetSpan.offsetWidth;
        const containerWidth = container.offsetWidth;

        const scrollPosition = spanOffset - containerWidth / 2 + spanWidth / 2;
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
}



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
    completionModal.style.display = 'flex';
}

// Optional buttons
playAgainButton.addEventListener('click', () => {
    completionModal.style.display = 'none';
    startLevel4();
});

startGameBtn.addEventListener('click', () => {
    introPage.classList.add('hidden');
    startLevel4();
});
