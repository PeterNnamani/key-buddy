import levels from './level.js';
import showCountdownAnimation from './util.js';
import { saveUserData } from './util.js';
import showRegistrationModal from './registration.js';
import makeRequest from './request.js';
import showLeaderboard from './leaderboard.js';


// Game elements
const textDisplay = document.getElementById('text-display');
const wrappedTextDisplay = document.getElementById('wrapped-text-display');
const progressFill = document.getElementById('progress-fill');
const currentLevelElement = document.getElementById('current-level');
const timerElement = document.getElementById('timer');
const typingSpeedElement = document.getElementById('typing-speed');
const accuracyElement = document.getElementById('accuracy');
const completionModal = document.getElementById('completion-modal');
const levelCompletionModal = document.getElementById('level-completion-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
const nextLevelButton = document.getElementById('next-level-button');
const typingInput = document.getElementById('hidden-input');
const typingInput2 = document.getElementById('hidden-input-2');
const typingInput3 = document.getElementById('hidden-input-3');
const startGameBtn = document.getElementById('start-game');
const introPage = document.getElementById('intro-page');
const keyboard = document.querySelector(".keyboard-container");
const keys = keyboard.querySelectorAll(".key");


let levelIndex = 0;
let level = {};
let currentSentence = '';
let startTime = null;
let timerInterval = null;
let correctChars = 0;
let currentIndex = 0;
let totalTypedChars = 0;
let level4Timeouts = [];

const gameStats = {
    levels: [],
    totalScore: 0,
    totalTime: 0,
    overallAccuracy: 100,
};

startGameBtn.addEventListener('click', () => {
    console.log('Start game ');
    introPage.classList.add('hidden');
    levelIndex = 0;
    gameStats.levels = [];
    gameStats.totalScore = 0;
    gameStats.totalTime = 0;
    gameStats.overallAccuracy = 100;

    startLevelWithCountdown(levelIndex);
});

nextLevelButton.addEventListener('click', () => {
    const hasRegistered = localStorage.getItem('has-registered') === 'true';
    levelCompletionModal.classList.add('hidden');
    levelIndex++;

    console.log('Level index ', levelIndex);
    console.log('has registered ', hasRegistered);

    if (levelIndex === 3 && !hasRegistered) {
        showRegistrationModal({
            saveUserData,
            makeRequest,
            onSubmit: () => {
                startLevel(levelIndex);
            }
        });
    } else if (levelIndex < levels.length) {
        startLevelWithCountdown(levelIndex);
    } else {

        // makeRequest({

        // });
    }
});

function startLevelWithCountdown(levelIdx) {
    levelCompletionModal.style.display = 'none';

    showCountdownAnimation(() => {
        startLevel(levelIdx);
    });
}

function startLevel(index) {
    console.log('Level index ', index);

    levelIndex = index;
    level = levels[index];

    if (index === 0) {
        textDisplay.classList.add('hidden');
        wrappedTextDisplay.classList.remove('hidden');
    } else {
        textDisplay.classList.remove('hidden');
        wrappedTextDisplay.classList.add('hidden');
    }

    resetGameUI();

    enableInput(typingInput);

    correctChars = 0;
    totalTypedChars = 0;
    startTime = null;

    currentSentence = getRandomSentence(index);

    currentLevelElement.textContent = (index + 1).toString();
    timerElement.textContent = `${level.timeLimit}`;

    // Setup level-specific render and logic
    switch (index) {
        case 0:
            startLevel1(currentSentence);
            return;
        case 1:
            startLevel2(currentSentence);
            return;
        case 2:
            startLevel3(currentSentence);
            return;
        case 3:
            startLevel4(currentSentence);
            return;
        case 4:
            startLevel5(currentSentence);
            return;
    }
}

function startLevel1(currentSentence) {
    renderSentence(currentSentence);
    startTimer();
}

function startLevel2(currentSentence) {
    renderSentence2(currentSentence);

    let timeLeft = level.timeLimit;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}`;
        if (timeLeft <= 0) {
            stopScrolling('scroll-text'); // Pause scroll
            endLevel();
        }
    }, 1000);
}

function startLevel3(currentSentence) {
    renderSentenceVertical(currentSentence);
    let timeLeft = level.timeLimit;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}`;
        if (timeLeft <= 0) {
            stopScrolling('scroll-text-vertical'); // Pause scroll
            endLevel();
        }
    }, 1000);
}

function startLevel4(currentSentence) {
    enableInput(typingInput3);

    const words = currentSentence.split(' ');
    let currentWordIndex = 0;

    let currentWord = '';
    let spans = [];

    function showWord(index) {
        if (index >= words.length) {
            endLevel();
            return;
        }

        currentWord = words[index];
        typingInput3.value = '';
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

        // Fade out and move to next word regardless of user input
        const fadeOutTimeout = setTimeout(() => {
            wordSpanContainer.classList.remove('fade-in');
            wordSpanContainer.classList.add('fade-out');

            // Wait for fade to complete
            const nextWordTimeout = setTimeout(() => {
                currentWordIndex++;
                progressFill.style.width = `${(currentWordIndex / words.length) * 100}%`;
                showWord(currentWordIndex);
            }, 500); // Match CSS fade-out duration

            level4Timeouts.push(nextWordTimeout);
        }, 5000); // Show word for 5s

        level4Timeouts.push(fadeOutTimeout);
    }

    showWord(currentWordIndex);
    startTimer();

    typingInput3.oninput = () => {
        if (!startTime) startTime = new Date();

        const userInput = typingInput3.value;
        totalTypedChars++;
        correctChars = 0;

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

        const accuracy = totalTypedChars === 0 ? 100 : Math.round((correctChars / totalTypedChars) * 100);
        accuracyElement.textContent = `${accuracy}%`;

        const elapsedTime = (new Date() - startTime) / 1000;
        const wordsTyped = currentWordIndex;
        const speedWPM = elapsedTime > 0 ? Math.round((wordsTyped / elapsedTime) * 60) : 0;
        typingSpeedElement.textContent = `${speedWPM} WPM`;
    };
}

function startLevel5(currentSentence) {
    enableInput(typingInput2);

    const words = currentSentence.split(' ');
    let currentWordIndex = 0;

    let activeSpans = [];

    let totalTypedChars = 0;
    let correctChars = 0;
    let startTime = null;

    // Render and drop one word every 4 seconds
    function renderFallingWord(index) {
        if (index >= words.length) return;

        const word = words[index];
        const wordContainer = document.createElement('div');
        wordContainer.className = 'falling-word';
        wordContainer.style.animation = 'fall 5s linear forwards';
        typingInput2.value = '';

        const spans = [];

        word.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.setAttribute('data-index', i);
            span.classList.add('word');
            wordContainer.appendChild(span);
            spans.push(span);
        });

        textDisplay.appendChild(wordContainer);

        activeSpans = spans;
    }

    // Interval to drop each word every 4 seconds
    const wordInterval = setInterval(() => {
        if (currentWordIndex >= words.length) {
            clearInterval(wordInterval);
            clearInterval(timerInterval);
            endLevel();
            return;
        }

        renderFallingWord(currentWordIndex);
        currentWordIndex++;
        progressFill.style.width = `${(currentWordIndex / words.length) * 100}%`;
    }, 4000);

    // Typing input logic (validates only active word)
    typingInput2.oninput = () => {
        if (!startTime) startTime = new Date();

        const userInput = typingInput2.value.trim();
        totalTypedChars++;

        activeSpans.forEach((span, i) => {
            const typedChar = userInput[i];
            const expectedChar = span.textContent;

            span.classList.remove('correct', 'incorrect');

            if (typedChar == null) {
                return;
            }

            if (typedChar === expectedChar) {
                span.classList.add('correct');
                correctChars++;
            } else {
                span.classList.add('incorrect');
            }
        });

        const accuracy = totalTypedChars === 0
            ? 100
            : Math.min(Math.round((correctChars / totalTypedChars) * 100), 100);
        accuracyElement.textContent = `${accuracy}%`;

        const elapsedTime = (new Date() - startTime) / 1000;
        const speedWPM = elapsedTime > 0
            ? Math.round((currentWordIndex / elapsedTime) * 60)
            : 0;
        typingSpeedElement.textContent = `${speedWPM} WPM`;
    };

    // Timer countdown
    let timeLeft = level.timeLimit;
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            clearInterval(wordInterval);
            endLevel();
        }
    }, 1000);
}

function startTimer() {
    let timeLeft = level.timeLimit;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}`;
        if (timeLeft <= 0) {
            endLevel();
        }
    }, 1000);
}

function getRandomSentence(index) {
    level = levels[index];
    const idx = Math.floor(Math.random() * level.words.length);
    return level.words[idx];
}

function renderSentenceVertical(sentence) {
    textDisplay.innerHTML = '';

    const scrollingSpan = document.createElement('div');
    scrollingSpan.classList.add('scroll-text-vertical');
    scrollingSpan.style.animationDuration = '16s'; // Adjust based on sentence length if needed

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
    scrollingSpan.style.animationDuration = '30s'; // You can adjust based on sentence length

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
    wrappedTextDisplay.innerHTML = '';
    sentence.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.setAttribute('data-index', index);
        span.classList.add('word');
        wrappedTextDisplay.appendChild(span);
    });
}

typingInput.addEventListener('input', () => {
    if (!startTime) startTime = new Date();

    const userInput = typingInput.value;
    totalTypedChars = userInput.length;

    const spans = levelIndex === 0 ?
        wrappedTextDisplay.querySelectorAll('span')
        : textDisplay.querySelectorAll('span');

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

function stopScrolling(elementId) {
    const scrollSpan = document.querySelector(`.${elementId}`);
    if (scrollSpan) scrollSpan.style.animationPlayState = 'paused';
}

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
    disableInput(typingInput);
    disableInput(typingInput2);
    disableInput(typingInput3);

    if(levelIndex === 3) cleanupLevel4();

    const timeTaken = (new Date() - startTime) / 1000 || 0.01;
    // const wordsTyped = currentSentence.trim().split(/\s+/).length;
    const speedWPM = Math.round(((totalTypedChars / 5) / timeTaken) * 60);
    const accuracy = totalTypedChars === 0 ? 100 :
        Math.min(Math.round((correctChars / totalTypedChars) * 100), 100);
    const score = Math.round(speedWPM * (accuracy / 100));

    // Save level stats
    gameStats.levels[levelIndex] = {
        level: levelIndex + 1,
        score,
        accuracy,
        speedWPM,
        timeTaken: timeTaken.toFixed(2),
    };

    // Update total stats
    gameStats.totalScore += score;
    gameStats.totalTime += timeTaken;
    // Recalculate overall accuracy as average of all levels
    const totalAccuracySum = gameStats.levels.reduce((sum, lvl) => sum + lvl.accuracy, 0);
    gameStats.overallAccuracy = Math.round(totalAccuracySum / gameStats.levels.length);

    // Show level completion modal with stats
    showLevelCompletionModal(score, accuracy, speedWPM, timeTaken);

    // The flow to next level is handled by nextLevelButton event

    typingSpeedElement.textContent = `${speedWPM} WPM`;
    accuracyElement.textContent = `${accuracy}%`;
    // scoreElement.textContent = score;
}

function showLevelCompletionModal(score, accuracy, speedWPM, timeTaken) {
    levelCompletionModal.style.display = 'flex';
    document.getElementById('level-modal-score').textContent = score;
    document.getElementById('level-modal-accuracy').textContent = `${accuracy}%`;
    document.getElementById('level-modal-speed').textContent = `${speedWPM} WPM`;
    document.getElementById('level-modal-time').textContent = `${timeTaken.toFixed(2)}s`;
}

function showFinalResults() {
    levelCompletionModal.style.display = 'none';
    completionModal.style.display = 'flex';

    document.getElementById('modal-score').textContent = gameStats.totalScore;
    document.getElementById('modal-time').textContent = gameStats.totalTime.toFixed(2);
    document.getElementById('modal-accuracy').textContent = `${gameStats.overallAccuracy}%`;
    document.getElementById('modal-speed').textContent = `${Math.round((gameStats.totalScore / gameStats.totalTime) * 60)} WPM`;

    document.getElementById('view-leaderboard').addEventListener('click', () => {
        completionModal.style.display = 'none';
        leaderboardModal.style.display = 'flex';
        showLeaderboard();
    });

    document.getElementById('play-again').addEventListener('click', () => {
        location.reload();
    });

    // const closeLeaderboardButton = document.getElementById('close-leaderboard');
    // const backToResultsButton = document.getElementById('back-to-results');
}

function resetGameUI() {
    progressFill.style.width = '0%';
    accuracyElement.textContent = '100%';
    typingSpeedElement.textContent = '0 WPM';
    timerElement.textContent = `${levels[levelIndex].timeLimit} s`;
    textDisplay.innerHTML = '';
    wrappedTextDisplay.innerHTML = '';
}

function enableInput(input) {
    input.onpaste = (e) => e.preventDefault();
    input.value = '';
    input.disabled = false;
    input.focus();
}

function disableInput(input) {
    input.disabled = true;
}

function cleanupLevel4() {
    level4Timeouts.forEach(clearTimeout);
    level4Timeouts = [];
    typingInput3.oninput = null;
    textDisplay.classList.remove('fade-in', 'fade-out');
}