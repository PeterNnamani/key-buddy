import levels from './level.js';
import showCountdownAnimation from './util.js';
import { saveUserData } from './util.js';
import showRegistrationModal from './registration.js';
import showLeaderboard from './leaderboard.js';

document.addEventListener('DOMContentLoaded', () => {
  // Game elements
  const textDisplay = document.getElementById('text-display');
  const progressFill = document.getElementById('progress-fill');
  const currentLevelElement = document.getElementById('current-level');
  const timerElement = document.getElementById('timer');
  const typingSpeedElement = document.getElementById('typing-speed');
  const accuracyElement = document.getElementById('accuracy');
  const scoreElement = document.getElementById('score');
  const levelProgressElement = document.getElementById('level-progress');
  const completionModal = document.getElementById('completion-modal');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const viewLeaderboardButton = document.getElementById('view-leaderboard');
  const playAgainButton = document.getElementById('play-again');
  const closeLeaderboardButton = document.getElementById('close-leaderboard');
  const backToResultsButton = document.getElementById('back-to-results');
  //const modalScore = document.getElementById('modal-score');
  //const modalSpeed = document.getElementById('modal-speed');
  //const modalAccuracy = document.getElementById('modal-accuracy');
  //const modalTime = document.getElementById('modal-time');
  // const levelCompletionModal = document.getElementById('level-completion-modal');
  // const nextLevelButton = document.getElementById('next-level');
  // const levelModalScore = document.getElementById('level-modal-score');
  // const levelModalSpeed = document.getElementById('level-modal-speed');
  // const levelModalAccuracy = document.getElementById('level-modal-accuracy');

  // Game state
  let currentLevel = 1;
  let words = [];
  let currentWordIndex = 0;
  let correctWords = 0;
  let incorrectWords = 0;
  let startTime = null;
  let timer = null;
  let timeLeft = 60;
  let gameActive = false;
  let totalScore = 0;
  let totalTime = 0;
  let totalCorrectChars = 0;
  let totalTypedChars = 0;
 // let averageWPM = 0;

  // Check if user is registered
  let alreadyRegistered = localStorage.getItem('has-registered') === 'true';

  // Show leaderboard on load if user is registered
  const leaderboardData = JSON.parse(localStorage.getItem('keybuddyLeaderboard')) || [];
  if (localStorage.getItem('has-registered') === 'true') {
    // Show leaderboard first
    showLeaderboard(leaderboardData);
    document.getElementById('intro-page').classList.add('hidden');
  } else {
    // Show intro page for new users
    document.getElementById('intro-page').classList.remove('hidden');
  }

  // Initialize the game
  function initGame() {
    resetGameState();

    loadLevel(1);
    updateLevelIndicators();
    document.getElementById('intro-page').classList.add('hidden');

    // Start the game immediately
    startTimer();
  }

  // Reset game state
  function resetGameState() {
    currentLevel = 1;
    words = [];
    currentWordIndex = 0;
    correctWords = 0;
    incorrectWords = 0;
    startTime = null;
    clearInterval(timer);
    timer = null;
    timeLeft = 60;
    gameActive = false;
    totalScore = 0;
    totalTime = 0;
    totalCorrectChars = 0;
    totalTypedChars = 0;
    averageWPM = 0;
    // Reset UI
    timerElement.textContent = timeLeft;
    typingSpeedElement.textContent = '0 WPM';
    accuracyElement.textContent = '100%';
    scoreElement.textContent = '0';
    progressFill.style.width = '0%';
    levelProgressElement.style.width = '0%';
    currentLevelElement.textContent = currentLevel;
    // Reset level markers
    document.querySelectorAll('.level-marker').forEach((marker, index) => {
      if (index === 0) {
        marker.classList.add('active');
        marker.classList.remove('completed');
      } else {
        marker.classList.remove('active', 'completed');
      }
    });
  }

  // Load level
  function loadLevel(level) {
    const levelData = levels[level - 1];
    words = levelData.words.map((word) => word.toLowerCase()); // Convert all words to lowercase
    timeLeft = levelData.timeLimit;
    timerElement.textContent = timeLeft;
    currentWordIndex = 0;
    correctWords = 0;
    incorrectWords = 0;

    // For level 5, split the passage into individual words
    if (level === 5) {
      words = words[0].split(' ').slice(0, 50); // Limit to 50 words
    }

    // Shuffle words
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }

    // Display words
    displayWords();

    // Update level indicator
    currentLevelElement.textContent = level;

    // Reset progress bar
    progressFill.style.width = '0%';

    // Reset keyboard
    resetKeyboard();

    // Start the level immediately
    startTimer();
  }

  // Display words in the text display area
  function displayWords() {
    textDisplay.innerHTML = '';
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.minHeight = '300px';
    container.style.overflow = 'hidden';

    // Always clear any previous per-level timeouts and listeners
    if (window._levelTimeouts) {
      window._levelTimeouts.forEach(clearTimeout);
    }
    window._levelTimeouts = [];
    document.removeEventListener('keydown', window._levelKeydownHandler || (() => {}));
    window._levelKeydownHandler = null;
    // Only attach global handler for level 1
    if (window._globalKeydownHandler) {
      document.removeEventListener('keydown', window._globalKeydownHandler);
    }
    if (currentLevel === 1) {
      window._globalKeydownHandler = handleTyping;
      document.addEventListener('keydown', handleTyping);
    }

    // Level 1: All words appear at once, static
    if (currentLevel === 1) {
      words.forEach((word, index) => {
        const wordElement = document.createElement('span');
        wordElement.textContent = word;
        wordElement.classList.add('word');
        if (index === currentWordIndex) {
          wordElement.classList.add('current');
        }
        wordElement.style.opacity = '1';
        container.appendChild(wordElement);
      });
      textDisplay.appendChild(container);
      showNextKeySuggestion();
      // Timer is managed globally, nothing special needed
      return;
    }

    // Level 2: Scroll words from right to left, one at a time
    if (currentLevel === 2) {
      let level2Timeout = null;
      let isWordActive = false;
      function showWord(index) {
        container.innerHTML = '';
        if (index >= words.length) {
          document.removeEventListener('keydown', window._levelKeydownHandler);
          endLevel();
          return;
        }
        const wordElement = document.createElement('span');
        wordElement.textContent = words[index];
        wordElement.classList.add('word', 'current');
        wordElement.style.position = 'absolute';
        wordElement.style.top = '20%';
        wordElement.style.transform = 'translateY(-50%)';
        wordElement.style.right = '-200px';
        wordElement.style.opacity = '1';
        wordElement.style.transition = 'right 4.5s linear, opacity 0.3s';
        container.appendChild(wordElement);
        setTimeout(() => {
          wordElement.style.right = '100%';
          currentWordIndex = index;
          currentTypedWord = '';
          isWordActive = true;
          renderCurrentWordWithInput();
          showNextKeySuggestion();
        }, 10);
        // Hide after it reaches the left, and mark as incorrect if not typed
        level2Timeout = setTimeout(() => {
          wordElement.style.opacity = '0';
          if (gameActive && currentWordIndex === index && isWordActive) {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
            totalTypedChars += currentTypedWord.length;
            isWordActive = false;
            setTimeout(() => {
              currentWordIndex++;
              currentTypedWord = '';
              updateStats();
              showWord(index + 1);
            }, 300);
          }
        }, 4600);
        window._levelTimeouts.push(level2Timeout);
      }
      showWord(0);
      textDisplay.appendChild(container);
      window._levelKeydownHandler = function (e) {
        if (currentLevel !== 2 || !gameActive || !isWordActive) return;
        if (e.key === ' ') {
          e.preventDefault();
          const typedWord = currentTypedWord.trim().toLowerCase();
          const currentWord = words[currentWordIndex];
          if (typedWord === '') return;
          if (typedWord === currentWord) {
            updateWordStatus(currentWordIndex, 'correct');
            correctWords++;
            totalCorrectChars += currentWord.length;
          } else {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
          }
          totalTypedChars += typedWord.length;
          clearTimeout(level2Timeout);
          isWordActive = false;
          // Fade out the word, then show the next word after a short delay
          const wordElements = textDisplay.querySelectorAll('.word');
          if (wordElements[currentWordIndex]) {
            wordElements[currentWordIndex].style.opacity = '0';
          }
          setTimeout(() => {
            currentWordIndex++;
            currentTypedWord = '';
            updateStats();
            showWord(currentWordIndex);
          }, 300); // short delay for fade out
        } else if (e.key === 'Backspace') {
          currentTypedWord = currentTypedWord.slice(0, -1);
          renderCurrentWordWithInput();
        } else if (e.key.length === 1) {
          if (currentTypedWord.length < words[currentWordIndex].length + 10) {
            currentTypedWord += e.key;
            renderCurrentWordWithInput();
          }
        }
      };
      document.addEventListener('keydown', window._levelKeydownHandler);
      return;
    }

    // Level 3: Scroll words from bottom to top, one at a time
    if (currentLevel === 3) {
      let level3Timeout = null;
      function showWord(index) {
        container.innerHTML = '';
        if (index >= words.length) {
          document.removeEventListener('keydown', window._levelKeydownHandler);
          endLevel();
          return;
        }
        const wordElement = document.createElement('span');
        wordElement.textContent = words[index];
        wordElement.classList.add('word', 'current');
        wordElement.style.position = 'absolute';
        wordElement.style.left = '50%';
        wordElement.style.transform = 'translateX(-50%)';
        wordElement.style.bottom = '-40px';
        wordElement.style.opacity = '1';
        wordElement.style.transition = 'bottom 4.5s linear';
        container.appendChild(wordElement);
        setTimeout(() => {
          wordElement.style.bottom = '100%';
          currentWordIndex = index;
          currentTypedWord = '';
          renderCurrentWordWithInput();
          showNextKeySuggestion();
        }, 10);
        level3Timeout = setTimeout(() => {
          wordElement.style.opacity = '0';
          if (gameActive && currentWordIndex === index) {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
            totalTypedChars += currentTypedWord.length;
            currentWordIndex++;
            currentTypedWord = '';
            updateStats();
            showWord(index + 1);
          }
        }, 4600);
        window._levelTimeouts.push(level3Timeout);
      }
      showWord(0);
      textDisplay.appendChild(container);
      window._levelKeydownHandler = function (e) {
        if (currentLevel !== 3 || !gameActive) return;
        if (e.key === ' ') {
          e.preventDefault();
          const typedWord = currentTypedWord.trim().toLowerCase();
          const currentWord = words[currentWordIndex];
          if (typedWord === '') return;
          if (typedWord === currentWord) {
            updateWordStatus(currentWordIndex, 'correct');
            correctWords++;
            totalCorrectChars += currentWord.length;
          } else {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
          }
          totalTypedChars += typedWord.length;
          clearTimeout(level3Timeout);
          currentWordIndex++;
          currentTypedWord = '';
          updateStats();
          showWord(currentWordIndex);
        } else if (e.key === 'Backspace') {
          currentTypedWord = currentTypedWord.slice(0, -1);
          renderCurrentWordWithInput();
        } else if (e.key.length === 1) {
          if (currentTypedWord.length < words[currentWordIndex].length + 10) {
            currentTypedWord += e.key;
            renderCurrentWordWithInput();
          }
        }
      };
      document.addEventListener('keydown', window._levelKeydownHandler);
      return;
    }

    // Level 4: Words appear one by one, each for 5 seconds
    if (currentLevel === 4) {
      let level4Timeout = null;
      function showWord(index) {
        container.innerHTML = '';
        if (index >= words.length) {
          document.removeEventListener('keydown', window._levelKeydownHandler);
          endLevel();
          return;
        }
        const wordElement = document.createElement('span');
        wordElement.textContent = words[index];
        wordElement.classList.add('word', 'current');
        wordElement.style.position = 'absolute';
        wordElement.style.left = '50%';
        wordElement.style.top = '20%';
        wordElement.style.transform = 'translate(-50%, -50%)';
        wordElement.style.opacity = '1';
        wordElement.style.transition = 'opacity 0.5s';
        container.appendChild(wordElement);
        currentWordIndex = index;
        currentTypedWord = '';
        renderCurrentWordWithInput();
        showNextKeySuggestion();
        level4Timeout = setTimeout(() => {
          wordElement.style.opacity = '0';
          if (gameActive && currentWordIndex === index) {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
            totalTypedChars += currentTypedWord.length;
            currentWordIndex++;
            currentTypedWord = '';
            updateStats();
            showWord(index + 1);
          }
        }, 5000);
        window._levelTimeouts.push(level4Timeout);
      }
      showWord(0);
      textDisplay.appendChild(container);
      window._levelKeydownHandler = function (e) {
        if (currentLevel !== 4 || !gameActive) return;
        if (e.key === ' ') {
          e.preventDefault();
          const typedWord = currentTypedWord.trim().toLowerCase();
          const currentWord = words[currentWordIndex];
          if (typedWord === '') return;
          if (typedWord === currentWord) {
            updateWordStatus(currentWordIndex, 'correct');
            correctWords++;
            totalCorrectChars += currentWord.length;
          } else {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
          }
          totalTypedChars += typedWord.length;
          clearTimeout(level4Timeout);
          currentWordIndex++;
          currentTypedWord = '';
          updateStats();
          showWord(currentWordIndex);
        } else if (e.key === 'Backspace') {
          currentTypedWord = currentTypedWord.slice(0, -1);
          renderCurrentWordWithInput();
        } else if (e.key.length === 1) {
          if (currentTypedWord.length < words[currentWordIndex].length + 10) {
            currentTypedWord += e.key;
            renderCurrentWordWithInput();
          }
        }
      };
      document.addEventListener('keydown', window._levelKeydownHandler);
      return;
    }

    // Level 5: Words fall from top to bottom, one at a time
    if (currentLevel === 5) {
      let level5Timeout = null;
      function showWord(index) {
        container.innerHTML = '';
        if (index >= words.length) {
          document.removeEventListener('keydown', window._levelKeydownHandler);
          endLevel();
          return;
        }
        const wordElement = document.createElement('span');
        wordElement.textContent = words[index];
        wordElement.classList.add('word', 'current');
        wordElement.style.position = 'absolute';
        wordElement.style.left = '50%';
        wordElement.style.top = '-40px';
        wordElement.style.transform = 'translateX(-50%)';
        wordElement.style.opacity = '1';
        wordElement.style.transition = 'top 4.5s linear';
        container.appendChild(wordElement);
        setTimeout(() => {
          wordElement.style.top = '100%';
          currentWordIndex = index;
          currentTypedWord = '';
          renderCurrentWordWithInput();
          showNextKeySuggestion();
        }, 10);
        level5Timeout = setTimeout(() => {
          wordElement.style.opacity = '0';
          if (gameActive && currentWordIndex === index) {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
            totalTypedChars += currentTypedWord.length;
            currentWordIndex++;
            currentTypedWord = '';
            updateStats();
            showWord(index + 1);
          }
        }, 4600);
        window._levelTimeouts.push(level5Timeout);
      }
      showWord(0);
      textDisplay.appendChild(container);
      window._levelKeydownHandler = function (e) {
        if (currentLevel !== 5 || !gameActive) return;
        if (e.key === ' ') {
          e.preventDefault();
          const typedWord = currentTypedWord.trim().toLowerCase();
          const currentWord = words[currentWordIndex];
          if (typedWord === '') return;
          if (typedWord === currentWord) {
            updateWordStatus(currentWordIndex, 'correct');
            correctWords++;
            totalCorrectChars += currentWord.length;
          } else {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
          }
          totalTypedChars += typedWord.length;
          clearTimeout(level5Timeout);
          currentWordIndex++;
          currentTypedWord = '';
          updateStats();
          showWord(currentWordIndex);
        } else if (e.key === 'Backspace') {
          currentTypedWord = currentTypedWord.slice(0, -1);
          renderCurrentWordWithInput();
        } else if (e.key.length === 1) {
          if (currentTypedWord.length < words[currentWordIndex].length + 10) {
            currentTypedWord += e.key;
            renderCurrentWordWithInput();
          }
        }
      };
      document.addEventListener('keydown', window._levelKeydownHandler);
      return;
    }

    // After all per-level modes (after level 5 block), re-attach the global handler for static/fallback modes
    if (![2,3,4,5].includes(currentLevel)) {
      if (window._globalKeydownHandler) {
        document.removeEventListener('keydown', window._globalKeydownHandler);
      }
      window._globalKeydownHandler = handleTyping;
      document.addEventListener('keydown', handleTyping);
    }
    // ...existing code for fallback (should not be reached)...
  }

  // Add this helper to render the current word with per-letter coloring
  function renderCurrentWordWithInput() {
    const wordElements = textDisplay.querySelectorAll('.word');
    if (!wordElements[currentWordIndex]) return;

    const currentWord = words[currentWordIndex];
    // Remove previous content
    wordElements[currentWordIndex].innerHTML = '';

    // For each letter in the word, compare with typed input
    for (let i = 0; i < currentWord.length; i++) {
      const span = document.createElement('span');
      if (i < currentTypedWord.length) {
        if (currentTypedWord[i] === currentWord[i]) {
          span.className = 'text-green-600';
        } else {
          span.className = 'text-red-600';
        }
        span.textContent = currentWord[i];
      } else {
        span.textContent = currentWord[i];
      }
      wordElements[currentWordIndex].appendChild(span);
    }
    // Add extra letters (over-typed)
    if (currentTypedWord.length > currentWord.length) {
      for (let i = currentWord.length; i < currentTypedWord.length; i++) {
        const span = document.createElement('span');
        span.className = 'text-red-600';
        span.textContent = currentTypedWord[i];
        wordElements[currentWordIndex].appendChild(span);
      }
    }
    showNextKeySuggestion();
  }

  // Update word status (correct/incorrect) and progress bar
  function updateWordStatus(index, status) {
    const wordElements = textDisplay.querySelectorAll('.word');
    if (wordElements[index]) {
      wordElements[index].classList.remove('current');
      wordElements[index].classList.add(status);

      // Add strikethrough and color for completed word
      if (status === 'correct') {
        wordElements[index].style.textDecoration = 'line-through';
        wordElements[index].style.textDecorationColor = '#2ecc71';
      } else if (status === 'incorrect') {
        wordElements[index].style.textDecoration = 'line-through';
        wordElements[index].style.textDecorationColor = '#E74C3C';
      } else {
        wordElements[index].style.textDecoration = '';
      }
    }
    if (wordElements[index + 1]) {
      wordElements[index + 1].classList.add('current');
    }

    // Update progress bar only if the word is correct
    if (status === 'correct') {
      const progress =
        (correctWords / (currentLevel === 5 ? 50 : words.length)) * 100; // Target is 50 words for level 5
      progressFill.style.width = `${progress}%`;
    }
    showNextKeySuggestion();
  }

  // Start the game timer
  function startTimer() {
    if (timer) {
      clearInterval(timer);
    }
    startTime = Date.now();
    gameActive = true;
    timer = setInterval(() => {
      timeLeft--;
      timerElement.textContent = timeLeft;
      if (timeLeft <= 10) {
        timerElement.classList.add('text-secondary');
      } else {
        timerElement.classList.remove('text-secondary');
      }
      if (timeLeft <= 0) {
        endLevel();
      }
    }, 1000);
  }

  // End the current level
  function endLevel() {
    clearInterval(timer);
    gameActive = false;

    // Calculate level statistics
    const levelTime = levels[currentLevel - 1].timeLimit - timeLeft; // Time taken for the level
    const minutes = levelTime / 60;
    const wpm = Math.round(correctWords / Math.max(0.01, minutes)); // Words per minute
    const accuracy =
      Math.round((totalCorrectChars / totalTypedChars) * 100) || 100; // Accuracy percentage
    const levelScore = calculateLevelScore(correctWords, incorrectWords, wpm); // Level score

    // Update total statistics
    totalTime += levelTime;
    totalScore += levelScore;

    // Update modal content
    document.getElementById('level-modal-score').textContent = levelScore;
    document.getElementById('level-modal-speed').textContent = `${wpm} WPM`;
    document.getElementById(
      'level-modal-accuracy'
    ).textContent = `${accuracy}%`;
    document.getElementById('level-modal-time').textContent = `${levelTime}s`; // Time taken for the level
    document.getElementById(
      'level-completion-message'
    ).textContent = `You have successfully completed Level ${currentLevel}!`;

    // Check if it's the last level
    if (currentLevel === 5) {
      showCompletionModal();
    } else {
      const levelCompletionModal = document.getElementById(
        'level-completion-modal'
      );
      levelCompletionModal.classList.remove('hidden');

      const nextLevelButton = document.getElementById('next-level-button');
      if (currentLevel === 3) {
        if (alreadyRegistered) {
          nextLevelButton.textContent = 'Next Level';
          nextLevelButton.onclick = () => {
            levelCompletionModal.classList.add('hidden');
            showCountdownAnimation(() => {
              currentLevel++;
              loadLevel(currentLevel);
            });
          };
        } else {
          showRegistrationModal({
            showCountDown: function (level) {
              currentLevel = level;
              showCountdownAnimation(() => {
                loadLevel(level);
              });
            },
          });
          // Hide the level completion modal while registration is shown
          levelCompletionModal.classList.add('hidden');
        }
      } else {
        nextLevelButton.textContent = 'Next Level';
        nextLevelButton.onclick = () => {
          levelCompletionModal.classList.add('hidden');
          showCountdownAnimation(() => {
            currentLevel++;
            loadLevel(currentLevel);
          });
        };
      }
    }
  }

  // Calculate level score
  function calculateLevelScore(correct, incorrect, wpm) {
    const baseScore = correct * 10;
    const penaltyScore = incorrect * 5;
    const speedBonus = Math.floor(wpm / 10) * 20;
    return Math.max(0, baseScore - penaltyScore + speedBonus);
  }

  // Show completion modal (for the final level)
  function showCompletionModal() {
    const accuracy =
      Math.round((totalCorrectChars / totalTypedChars) * 100) || 100;
    const averageWPM = Math.round(totalCorrectChars / 5 / (totalTime / 60));

    // Update modal content
    document.getElementById('modal-score').textContent = totalScore;
    document.getElementById('modal-speed').textContent = `${averageWPM} WPM`;
    document.getElementById('modal-accuracy').textContent = `${accuracy}%`;
    document.getElementById('modal-time').textContent = `${totalTime}s`;

    // Add player to leaderboard
    addToLeaderboard(totalScore, averageWPM, totalTime, accuracy);

    // Show the final completion modal
    const completionModal = document.getElementById('completion-modal');
    completionModal.classList.remove('hidden');
    // Show countdown before restarting if play again is clicked
    playAgainButton.onclick = () => {
      completionModal.classList.add('hidden');
      showCountdownAnimation(() => {
        initGame();
      });
    };
  }

  // Update level indicators
  function updateLevelIndicators() {
    document.querySelectorAll('.level-marker').forEach((marker, index) => {
      if (index < currentLevel - 1) {
        marker.classList.add('completed');
        marker.classList.remove('active');
      } else if (index === currentLevel - 1) {
        marker.classList.add('active');
        marker.classList.remove('completed');
      } else {
        marker.classList.remove('active', 'completed');
      }
    });
  }

  // Add player to leaderboard
  function addToLeaderboard(score, speed, time, accuracy) {
    // Get user data
    const userData = JSON.parse(localStorage.getItem('user-data') || '{}');

    userData.score = score > userData.score ? score : userData.score;
    userData.speed = speed > userData.speed ? speed : userData.speed;
    userData.accuracy =
      accuracy > userData.accuracy ? accuracy : userData.accuracy;
    userData.time = time > userData.time ? time : userData.time;

    console.log('Updated user data:', userData);
    // Save user data to local storage
    saveUserData(userData);
    // Save user data to the server
    makeRequest(userData);
  }

  async function makeRequest(payload) {
    console.log('Sending to API:', payload);

    try {
      const response = await fetch(
        'https://linkskool.net/api/v1/keybuddy.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (result.status) {
        const matchingUser = result.response.find(
          (user) => user.username === payload.username
        );

        if (matchingUser) {
          payload.id = matchingUser.id;
          payload.type = 'update';
          saveUserData(payload);
          console.log(`Updated payload with ID:`, payload);
        } else {
          console.warn('Username not found in response. ID not updated.');
        }

        //showLeaderboard(result.response);
        viewLeaderboardButton.addEventListener(
          'click',
          showLeaderboard(result.response)
        );
      }
    } catch (error) {
      console.error('API error:', error);
    }
  }

  // Reset keyboard
  function resetKeyboard() {
    document.querySelectorAll('.key').forEach((key) => {
      key.classList.remove(
        'key-pressed',
        'key-next',
        'key-wrong',
        'key-correct'
      );
    });
  }

  // Update keyboard display (now only for pressed/correct/wrong, not suggestion)
  function updateKeyboard(key, status) {
    // Only remove pressed/correct/wrong, not suggestion
    document.querySelectorAll('.key').forEach((k) => {
      k.classList.remove('key-pressed', 'key-wrong', 'key-correct');
    });
    const keyElement = document.querySelector(`[data-key="${key}"]`);
    if (keyElement) {
      keyElement.classList.add(`key-${status}`);
    }
  }

  // Get key code for a character
  function getKeyCode(char) {
    if (char >= 'A' && char <= 'Z') {
      return `Key${char}`;
    } else if (char >= '0' && char <= '9') {
      return `Digit${char}`;
    } else if (char === ' ') {
      return 'Space';
    } else {
      // Map special characters to their key codes
      const specialChars = {
        '.': 'Period',
        ',': 'Comma',
        '/': 'Slash',
        ';': 'Semicolon',
        "'": 'Quote',
        '[': 'BracketLeft',
        ']': 'BracketRight',
        '\\': 'Backslash',
        '-': 'Minus',
        '=': 'Equal',
        '`': 'Backquote',
      };
      return specialChars[char] || null;
    }
  }

  // Update typing statistics
  function updateStats() {
    if (!startTime || !gameActive) return;
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000 / 60; // in minutes
    // Calculate WPM
    const wpm = Math.round(correctWords / Math.max(0.01, elapsedTime));
    typingSpeedElement.textContent = `${wpm} WPM`;
    // Calculate accuracy
    const accuracy =
      Math.round((correctWords / (correctWords + incorrectWords)) * 100) || 100;
    accuracyElement.textContent = `${accuracy}%`;
    // Update progress bar
    const progress = (currentWordIndex / words.length) * 100;
    progressFill.style.width = `${progress}%`;
  }

  // Highlight the next key to type (suggestion) in a clear color
  function showNextKeySuggestion() {
    // Remove previous suggestions
    document.querySelectorAll('.key-suggest').forEach((k) => k.classList.remove('key-suggest'));
    if (currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex];
      if (currentWord) {
        // If not finished typing the word, suggest the next character
        if (currentTypedWord.length < currentWord.length) {
          const nextChar = currentWord[currentTypedWord.length];
          if (nextChar) {
            // Support both upper and lower case
            const nextKey = getKeyCode(nextChar.toUpperCase());
            const nextKeyElement = document.querySelector(`[data-key="${nextKey}"]`);
            if (nextKeyElement) {
              nextKeyElement.classList.add('key-suggest');
            }
          }
        } else {
          // Suggest space bar when word is complete
          const spaceKey = document.querySelector('[data-key="Space"]');
          if (spaceKey) {
            spaceKey.classList.add('key-suggest');
          }
        }
      }
    }
  }

  // Unified keyboard handler for all levels
  function handleTyping(e) {
    if (!gameActive) {
      // Start game on Enter if not active
      if (e.key === 'Enter') {
        startTimer();
      }
      return;
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      currentTypedWord = currentTypedWord.slice(0, -1);
      renderCurrentWordWithInput();
      updateKeyboard('Backspace', 'pressed');
      return;
    }

    // Ignore non-character keys except Space
    if (e.key.length > 1 && e.key !== ' ') return;

    // Handle Space key for word completion
    if (e.key === ' ') {
      e.preventDefault();
      const typedWord = currentTypedWord.trim().toLowerCase();
      const currentWord = words[currentWordIndex];
      if (typedWord === '') return;

      // Check if word is correct
      if (typedWord === currentWord) {
        updateWordStatus(currentWordIndex, 'correct');
        correctWords++;
        totalCorrectChars += currentWord.length;
        updateKeyboard('Space', 'correct');
      } else {
        updateWordStatus(currentWordIndex, 'incorrect');
        incorrectWords++;
        updateKeyboard('Space', 'wrong');
      }
      totalTypedChars += typedWord.length;

      // Move to next word
      currentWordIndex++;
      currentTypedWord = '';

      // Check if all words are completed (for static levels)
      if (
        (currentLevel === 1 && currentWordIndex >= words.length) ||
        (currentLevel === 5 && correctWords >= 50)
      ) {
        endLevel();
      } else if (
        [2, 3, 4, 5].includes(currentLevel) && currentWordIndex < words.length
      ) {
        // For scrolling/falling levels, trigger next word
        displayWords();
      } else {
        renderCurrentWordWithInput();
      }
      updateStats();
      return;
    }

    // Append typed character to the current word
    if (currentTypedWord.length < (words[currentWordIndex]?.length || 0) + 10) {
      currentTypedWord += e.key;
      renderCurrentWordWithInput();
      updateKeyboard(e.code, 'pressed');
    }
  }

  // Remove all individual keydown handlers in displayWords and attach only the unified handler
  // Remove previous keydown event listeners if any
  if (window._globalKeydownHandler) {
    document.removeEventListener('keydown', window._globalKeydownHandler);
  }
  window._globalKeydownHandler = handleTyping;
  document.addEventListener('keydown', handleTyping);

  // Initialize the current typed word
  let currentTypedWord = '';

  // Play again button
  playAgainButton.addEventListener('click', () => {
    completionModal.classList.add('hidden');
    initGame();
  });

  // Close leaderboard button
  closeLeaderboardButton.addEventListener('click', () => {
    leaderboardModal.classList.add('hidden');
  });

  // Back to results button
  backToResultsButton.addEventListener('click', () => {
    leaderboardModal.classList.add('hidden');
    completionModal.classList.remove('hidden');
  });

  // Play again button on leaderboard modal
  const playAgainLeaderboardButton = document.getElementById('play-again-leaderboard');
  if (playAgainLeaderboardButton) {
    playAgainLeaderboardButton.addEventListener('click', () => {
      leaderboardModal.classList.add('hidden');
      completionModal.classList.add('hidden'); // <-- Hide the final modal too
      showCountdownAnimation(() => {
        initGame(); // Fully restart the game from level 1
      });
    });
  }

  // Start game button
  const startGameBtn = document.getElementById('start-game');
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      document.getElementById('intro-page').classList.add('hidden');
      showCountdownAnimation(() => {
        initGame();
      });
    });
  }

  // Display user info if available
  const user = JSON.parse(localStorage.getItem('user-data'));
  if (user) {
    // You could add a user info display here if desired
    console.log(`Welcome back, ${user.username}!`);
  }

});
