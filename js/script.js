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
  const leaderboardBody = document.getElementById('leaderboard-body');
  const modalScore = document.getElementById('modal-score');
  const modalSpeed = document.getElementById('modal-speed');
  const modalAccuracy = document.getElementById('modal-accuracy');
  const modalTime = document.getElementById('modal-time');
  const levelCompletionModal = document.getElementById(
    'level-completion-modal'
  );
  const nextLevelButton = document.getElementById('next-level');
  const levelModalScore = document.getElementById('level-modal-score');
  const levelModalSpeed = document.getElementById('level-modal-speed');
  const levelModalAccuracy = document.getElementById('level-modal-accuracy');

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
  let averageWPM = 0;

  // Level configurations
  const levels = [
    {
      // Level 1
      words: [
        'the',
        'and',
        'for',
        'you',
        'that',
        'have',
        'with',
        'this',
        'from',
        'they',
        'will',
        'one',
        'would',
        'there',
        'their',
        'what',
        'about',
        'which',
        'when',
        'your',
      ],
      timeLimit: 10,
      requiredSpeed: 20,
    },
    {
      // Level 2
      words: [
        'because',
        'people',
        'through',
        'information',
        'different',
        'national',
        'important',
        'development',
        'government',
        'education',
        'community',
        'experience',
        'technology',
        'available',
        'following',
        'resources',
        'including',
        'business',
        'management',
        'activities',
      ],
      timeLimit: 10,
      requiredSpeed: 30,
    },
    {
      // Level 3
      words: [
        'responsibility',
        'communication',
        'understanding',
        'opportunities',
        'organization',
        'particularly',
        'international',
        'relationship',
        'environment',
        'development',
        'significant',
        'traditional',
        'professional',
        'successfully',
        'requirements',
        'individuals',
        'performance',
        'experience',
        'everything',
        'technology',
      ],
      timeLimit: 10,
      requiredSpeed: 40,
    },
    {
      // Level 4
      words: [
        'Happened',
        'Outspoken',
        'Conversed',
        'Decorated',
        'Authorize',
        'Vacation',
        'Harmonize',
        'Energized',
        'Finalized',
        'Generated',
        'Recommends',
        'Enriching',
        'Discover',
        'Encounter',
        'Authoring',
        'Completes',
        'Delighted',
        'Authored',
        'Sharpened',
        'Gathered',
        'Dreamland',
        'Freshener',
        'Harmonies',
        'Energizer',
        'Finalists',
        'Generated',
        'Rewritten',
        'Enriched',
        'Declined',
        'Completed',
      ],
      timeLimit: 10,
      requiredSpeed: 20,
    },
    {
      // Level 5
      words: [
        "The journey of a thousand miles begins with a single step. Every great achievement requires time and dedication. Success is not final, failure is not fatal, it is the courage to continue that counts. Believe you can and you're halfway there. The future belongs to those who believe in the beauty of their dreams.",
      ],
      timeLimit: 10,
      requiredSpeed: 20,
    },
  ];

  // Leaderboard data - now only the real user will be shown
  let leaderboardData = [];

  // Load saved leaderboard data if available
  const savedLeaderboard = localStorage.getItem('keybuddyLeaderboard');
  if (savedLeaderboard) {
    leaderboardData = JSON.parse(savedLeaderboard);
  }

  // Check if user is registered
  let alreadyRegistered = !!localStorage.getItem('keybuddyUser');

  // Initialize the game
  function initGame() {
    resetGameState();

    // Check if we should start from level 4 (after registration)
    const startFromLevel = localStorage.getItem('startFromLevel');
    if (startFromLevel) {
      currentLevel = parseInt(startFromLevel, 10) || 1;
      localStorage.removeItem('startFromLevel');
    }

    loadLevel(currentLevel);
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
    container.style.minHeight = '300px'; // Match .typing-text height for full animation
    container.style.overflow = 'hidden';

    // Level 2: Scroll words from bottom to top, one at a time, always visible
    if (currentLevel === 2) {
      let level2Timeout = null;

      function showWord(index) {
        container.innerHTML = '';
        if (index >= words.length) {
          // Clean up handler when level ends
          document.removeEventListener('keydown', level2KeydownHandler);
          attachGlobalKeydownHandler();
          endLevel();
          return;
        }
        const wordElement = document.createElement('span');
        wordElement.textContent = words[index];
        wordElement.classList.add('word', 'current');
        wordElement.style.position = 'absolute';
        wordElement.style.left = '50%';
        wordElement.style.transform = 'translateX(-50%)';
        wordElement.style.bottom = '0px';
        wordElement.style.opacity = '1';
        wordElement.style.transition = 'bottom 5.5s linear';

        container.appendChild(wordElement);

        setTimeout(() => {
          wordElement.style.bottom = '340px';
          currentWordIndex = index;
          currentTypedWord = '';
          renderCurrentWordWithInput();
          showNextKeySuggestion();
        }, 10);

        // Hide after it reaches the top, and mark as incorrect if not typed
        level2Timeout = setTimeout(() => {
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
        }, 5600); // 5.5s + 0.1s buffer
      }
      showWord(0);
      textDisplay.appendChild(container);

      // --- Remove global handler and add level 2 handler ---
      if (globalKeydownHandler) {
        document.removeEventListener('keydown', globalKeydownHandler);
      }
      level2KeydownHandler = function (e) {
        if (currentLevel !== 2 || !gameActive) return;
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
          } else {
            updateWordStatus(currentWordIndex, 'incorrect');
            incorrectWords++;
          }
          totalTypedChars += typedWord.length;

          // Move to next word immediately
          clearTimeout(level2Timeout); // Cancel the timer
          currentWordIndex++;
          currentTypedWord = '';
          updateStats();
          showWord(currentWordIndex);
        } else if (e.key === 'Backspace') {
          currentTypedWord = currentTypedWord.slice(0, -1);
          renderCurrentWordWithInput();
        } else if (e.key.length === 1) {
          currentTypedWord += e.key;
          renderCurrentWordWithInput();
        }
      };
      document.addEventListener('keydown', level2KeydownHandler);
      return;
    }

    // Level 5: Show only one falling word at a time, continuously
    if (currentLevel === 5) {
      let passageWords = words;
      let fallingIndex = 0;
      let activeTimeout = null;

      function showNextFallingWord() {
        container.innerHTML = '';
        if (fallingIndex >= passageWords.length) {
          endLevel();
          return;
        }
        const wordSpan = document.createElement('span');
        wordSpan.textContent = passageWords[fallingIndex];
        wordSpan.classList.add('word', 'current');
        wordSpan.style.position = 'absolute';
        wordSpan.style.left = '50%';
        wordSpan.style.transform = 'translateX(-50%)';
        wordSpan.style.top = '-40px';
        wordSpan.style.opacity = '1';
        wordSpan.style.transition = 'top 2.5s linear'; // Slower fall

        container.appendChild(wordSpan);

        setTimeout(() => {
          wordSpan.style.top = '240px';
        }, 10);

        // Timeout for word to reach the bottom (slower)
        activeTimeout = setTimeout(() => {
          // If not typed, mark as missed/incorrect
          if (gameActive && currentWordIndex === fallingIndex) {
            wordSpan.classList.remove('current');
            wordSpan.classList.add('incorrect');
            incorrectWords++;
            totalTypedChars += currentTypedWord.length;
            currentWordIndex++;
            currentWordIndex++;
            currentTypedWord = '';
            updateStats();
            fallingIndex++;
            showNextFallingWord();
          }
        }, 3600); // Slower fall duration
      }

      // Listen for space to submit word
      function handleLevel5FallingTyping(e) {
        if (currentLevel !== 5 || !gameActive) {
          document.removeEventListener('keydown', handleLevel5FallingTyping);
          return;
        }
        if (e.key === ' ') {
          e.preventDefault();
          const typedWord = currentTypedWord.trim().toLowerCase();
          const currentWord = passageWords[fallingIndex];
          const wordElement = container.querySelector('.word.current');
          if (typedWord === '') return;

          if (typedWord === currentWord) {
            if (wordElement) {
              wordElement.classList.remove('current');
              wordElement.classList.add('correct');
            }
            correctWords++;
            totalCorrectChars += currentWord.length;
          } else {
            if (wordElement) {
              wordElement.classList.remove('current');
              wordElement.classList.add('incorrect');
            }
            incorrectWords++;
          }
          totalTypedChars += typedWord.length;
          currentTypedWord = '';
          clearTimeout(activeTimeout);
          currentWordIndex++;
          updateStats();
          fallingIndex++;
          setTimeout(showNextFallingWord, 100); // Small delay before next word
        } else {
          currentTypedWord += e.key;
        }
      }

      // Reset state for level 5
      currentTypedWord = '';
      currentWordIndex = 0;
      document.removeEventListener('keydown', handleLevel5FallingTyping);
      document.addEventListener('keydown', handleLevel5FallingTyping);

      showNextFallingWord();
      textDisplay.appendChild(container);
      return;
    }

    words.forEach((word, index) => {
      const wordElement = document.createElement('span');
      wordElement.textContent = word;
      wordElement.classList.add('word');
      if (index === currentWordIndex) {
        wordElement.classList.add('current');
      }

      switch (currentLevel) {
        case 1:
          // Static display
          wordElement.style.opacity = '1';
          break;

        case 2:
          wordElement.style.position = 'absolute';
          wordElement.style.left = '50%';
          wordElement.style.transform = 'translateX(-50%)';
          wordElement.style.bottom = '-50px'; // start below
          const scrollDuration = 4000;
          const level2DelayBetweenWords = scrollDuration;

          setTimeout(() => {
            wordElement.style.transition = `bottom ${
              scrollDuration / 2000
            }s linear`;
            wordElement.style.bottom = '100%';
          }, index * level2DelayBetweenWords);

          // Move to next word when word disappears
          setTimeout(() => {
            if (!gameActive) return;
            if (currentWordIndex === index) {
              // If user hasn't finished typing, mark as incorrect
              if (currentTypedWord.trim() !== words[currentWordIndex]) {
                updateWordStatus(currentWordIndex, 'incorrect');
                incorrectWords++;
                totalTypedChars += currentTypedWord.length;
              }
              currentWordIndex++;
              currentTypedWord = '';
              if (currentWordIndex < words.length) {
                renderCurrentWordWithInput();
              }
              updateStats();
              // End level if last word
              if (currentWordIndex >= words.length) {
                endLevel();
              }
            }
          }, (index + 1) * level2DelayBetweenWords);
          break;

        case 3:
          if (index === 0) {
            let slideIndex = 0;
            let typed = '';

            function slideNextWord() {
              container.innerHTML = '';
              if (slideIndex >= words.length) {
                endLevel();
                return;
              }
              typed = '';
              currentWordIndex = slideIndex;
              currentTypedWord = '';
              const wordSpan = document.createElement('span');
              wordSpan.textContent = words[slideIndex];
              wordSpan.classList.add('word', 'current');
              wordSpan.style.position = 'absolute';
              wordSpan.style.right = '-100%';
              wordSpan.style.top = '50%';
              wordSpan.style.transform = 'translateY(-50%)';
              wordSpan.style.transition = 'right 0s';

              container.appendChild(wordSpan);

              setTimeout(() => {
                wordSpan.style.right = '0%';
              }, 10);

              setTimeout(() => {
                wordSpan.style.transition = 'right 5.5s linear';
                wordSpan.style.right = '110%';
              }, 30);

              function handleTyping(e) {
                if (currentLevel !== 3 || !gameActive) {
                  document.removeEventListener('keydown', handleTyping);
                  return;
                }
                if (e.key === 'Backspace') {
                  typed = typed.slice(0, -1);
                  currentTypedWord = typed;
                  renderCurrentWordWithInput();
                  return;
                }
                if (e.key === ' ') {
                  e.preventDefault();
                  const typedWord = typed.trim().toLowerCase();
                  const currentWord = words[slideIndex];
                  if (typedWord === '') return;
                  if (typedWord === currentWord) {
                    wordSpan.classList.remove('current');
                    wordSpan.classList.add('correct');
                    correctWords++;
                    totalCorrectChars += currentWord.length;
                  } else {
                    wordSpan.classList.remove('current');
                    wordSpan.classList.add('incorrect');
                    incorrectWords++;
                  }
                  totalTypedChars += typedWord.length;
                  typed = '';
                  document.removeEventListener('keydown', handleTyping);
                  setTimeout(() => {
                    slideIndex++;
                    updateStats();
                    slideNextWord();
                  }, 200);
                } else if (e.key.length === 1) {
                  typed += e.key;
                  currentTypedWord = typed;
                  renderCurrentWordWithInput();
                }
              }
              document.removeEventListener('keydown', handleTyping);
              document.addEventListener('keydown', handleTyping);

              setTimeout(() => {
                if (
                  gameActive &&
                  typed.trim().toLowerCase() !== words[slideIndex]
                ) {
                  wordSpan.classList.remove('current');
                  wordSpan.classList.add('incorrect');
                  incorrectWords++;
                  totalTypedChars += typed.length;
                  typed = '';
                  document.removeEventListener('keydown', handleTyping);
                  updateStats();
                }
                slideIndex++;
                slideNextWord();
              }, 5700); // Animation duration + buffer
            }

            slideNextWord();
            textDisplay.appendChild(container);
            return;
          }
          return;

        case 4:
          // Words appear one by one, stay for 10 seconds, then disappear
          wordElement.style.position = 'absolute';
          wordElement.style.left = '50%'; // Center horizontally
          wordElement.style.top = '50%'; // Center vertically
          wordElement.style.transform = 'translate(-50%, -50%)'; // Adjust for both horizontal and vertical centering
          wordElement.style.opacity = '0'; // Initially hidden
          wordElement.style.transition = 'opacity 0.5s ease-in-out';
          // Smooth fade-in and fade-out

          // Only show one word at a time with a 10-second display time
          const displayTime = 8000; // 10 seconds in milliseconds
          const level4DelayBetweenWords = displayTime; // Each word gets the full display time

          // Schedule when this word should appear
          setTimeout(() => {
            if (!gameActive) return; // Stop if the level is no longer active

            // Make the word visible
            wordElement.style.opacity = '1'; // Fade in

            // Schedule when this word should disappear
            setTimeout(() => {
              if (!gameActive) return; // Stop if the level is no longer active
              wordElement.style.opacity = '0'; // Fade out after 10 seconds
            }, displayTime - 500); // Start fade-out 0.5 seconds before the next word
          }, index * level4DelayBetweenWords); // Delay each word's animation based on its index
          break;

        case 5:
          if (index === 0) {
            const passageWords = words[0].split(' ');
            let activeWordTimeouts = [];

            // Reset state
            currentTypedWord = '';
            currentWordIndex = 0;

            // Create and animate each word
            passageWords.forEach((passageWord, wordIndex) => {
              const wordSpan = document.createElement('span');
              wordSpan.textContent = passageWord;
              wordSpan.classList.add('word');

              wordSpan.style.position = 'absolute';
              wordSpan.style.left = `${20 + Math.random() * 60}%`;
              wordSpan.style.top = '-40px';
              wordSpan.style.opacity = '0';
              wordSpan.style.transition = 'top 3s linear, opacity 0.5s ease';

              wordSpan.dataset.wordIndex = wordIndex;
              container.appendChild(wordSpan);

              setTimeout(() => {
                if (!gameActive) return;

                wordSpan.style.opacity = '1';
                wordSpan.style.top = '120%';

                if (wordIndex === currentWordIndex) {
                  wordSpan.classList.add('current');

                  // Set timeout to auto-move to next word if not typed
                  const disappearTimeout = setTimeout(() => {
                    // Word disappears and is missed
                    if (currentWordIndex === wordIndex) {
                      wordSpan.classList.remove('current');
                      wordSpan.classList.add('missed');
                      incorrectWords++;
                      moveToNextWord();
                    }
                  }, 3000); // Word falls over 3s

                  activeWordTimeouts.push(disappearTimeout);
                }
              }, wordIndex * 1200);
            });

            // Keydown listener
            document.addEventListener(
              'keydown',
              function handleLevel5Typing(e) {
                if (currentLevel !== 5 || !gameActive) {
                  document.removeEventListener('keydown', handleLevel5Typing);
                  return;
                }

                if (e.key === ' ') {
                  e.preventDefault();

                  const typedWord = currentTypedWord.trim().toLowerCase();
                  const currentPassageWord = passageWords[currentWordIndex];
                  const currentWordElement = container.querySelector(
                    `[data-word-index="${currentWordIndex}"]`
                  );

                  if (typedWord === '') return;

                  if (typedWord === currentPassageWord) {
                    if (currentWordElement) {
                      currentWordElement.classList.remove('current');
                      currentWordElement.classList.add('correct');
                    }
                    correctWords++;
                    totalCorrectChars += currentPassageWord.length;
                  } else {
                    if (currentWordElement) {
                      currentWordElement.classList.remove('current');
                      currentWordElement.classList.add('incorrect');
                    }
                    incorrectWords++;
                  }

                  totalTypedChars += typedWord.length;
                  currentTypedWord = '';

                  // Clear timeout for this word
                  clearTimeout(activeWordTimeouts[currentWordIndex]);

                  moveToNextWord();
                  updateStats();
                } else {
                  currentTypedWord += e.key;
                }
              }
            );

            // Move to next word
            function moveToNextWord() {
              currentWordIndex++;
              if (currentWordIndex < passageWords.length) {
                const nextWordElement = container.querySelector(
                  `[data-word-index="${currentWordIndex}"]`
                );
                if (nextWordElement) {
                  nextWordElement.classList.add('current');

                  // Auto-remove if not typed in time
                  const disappearTimeout = setTimeout(() => {
                    if (
                      currentWordIndex ===
                      Number(nextWordElement.dataset.wordIndex)
                    ) {
                      nextWordElement.classList.remove('current');
                      nextWordElement.classList.add('missed');
                      incorrectWords++;
                      moveToNextWord();
                      updateStats();
                    }
                  }, 3000); // 3s fall

                  activeWordTimeouts.push(disappearTimeout);
                }
              } else {
                endLevel();
              }
            }
          }
          break;

          // Don't render the original word for level 5 since we're handling it specially
          return;
      }

      container.appendChild(wordElement);
    });

    textDisplay.appendChild(container);
    showNextKeySuggestion();
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

  // Helper: Show countdown animation before next level
  function showCountdownAnimation(callback) {
    // Remove any existing countdown
    let oldCountdown = document.getElementById('countdown-overlay');
    if (oldCountdown) oldCountdown.remove();

    const overlay = document.createElement('div');
    overlay.id = 'countdown-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(255,255,255,0.85)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.pointerEvents = 'none';

    const number = document.createElement('div');
    number.style.fontSize = '7rem';
    number.style.fontWeight = 'bold';
    number.style.color = '#2ECC71';
    number.style.textShadow = '0 4px 32px #0002';
    number.style.transition = 'transform 0.3s, opacity 0.3s';
    number.style.fontFamily = "'Poppins', 'Arial', sans-serif";
    overlay.appendChild(number);

    document.body.appendChild(overlay);

    let count = 3;
    function animate() {
      number.textContent = count;
      number.style.opacity = '1';
      number.style.transform = 'scale(1.2)';
      setTimeout(() => {
        number.style.opacity = '0.5';
        number.style.transform = 'scale(0.8)';
      }, 600);
      setTimeout(() => {
        count--;
        if (count > 0) {
          animate();
        } else {
          overlay.remove();
          if (typeof callback === 'function') callback();
        }
      }, 1000);
    }
    animate();
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
          showRegistrationModal();
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

  // Show registration modal and handle registration logic
  function showRegistrationModal() {
    const registrationModal = document.getElementById('registration-modal');
    registrationModal.classList.remove('hidden');

    // Avatar selection
    const avatarOptions = registrationModal.querySelectorAll('.avatar-option');
    const selectedAvatarInput =
      registrationModal.querySelector('#selected-avatar');
    avatarOptions.forEach((option) => {
      option.onclick = function () {
        avatarOptions.forEach((opt) => opt.classList.remove('selected'));
        this.classList.add('selected');
        selectedAvatarInput.value = this.dataset.avatar;
      };
    });

    // Registration form submit
    const registrationForm =
      registrationModal.querySelector('#registration-form');
    if (!registrationForm.dataset.listenerAttached) {
      registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
          name: registrationModal.querySelector('#name').value,
          username: registrationModal.querySelector('#username').value,
          email: registrationModal.querySelector('#email').value,
          phone: registrationModal.querySelector('#phone').value,
          avatar: registrationModal.querySelector('#selected-avatar').value,
          totalScore: 0,
          totalSpeed: 0,
          totalTime: 0,
        };
        localStorage.setItem('keybuddyUser', JSON.stringify(formData));
        alreadyRegistered = true;
        registrationModal.classList.add('hidden');
        // Immediately continue to level 4 after registration
        currentLevel = 4;
        showCountdownAnimation(() => {
          loadLevel(currentLevel);
        });
      });
      registrationForm.dataset.listenerAttached = 'true';
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
    addToLeaderboard(totalScore, averageWPM, totalTime);

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

  // Update level progress
  function updateLevelProgress() {
    const progress = ((currentLevel + 1) / 6) * 100;
    levelProgressElement.style.width = `${progress}%`;
    // Update level markers
    updateLevelIndicators();
  }

  // Show completion modal
  function showCompletionModal() {
    // Calculate final statistics
    const accuracy =
      Math.round((totalCorrectChars / totalTypedChars) * 100) || 100;
    averageWPM = Math.round(totalCorrectChars / 5 / (totalTime / 60));

    // Update modal content
    modalScore.textContent = totalScore;
    modalSpeed.textContent = `${averageWPM} WPM`;
    modalAccuracy.textContent = `${accuracy}%`;

    // Add player to leaderboard
    addToLeaderboard(totalScore, averageWPM, totalTime);

    // Show modal
    completionModal.classList.remove('hidden');
  }
  //  function sendLeaderboardToAPI() {
  //   const leaderboard = JSON.parse(localStorage.getItem('keybuddyLeaderboardJson') || '[]');
  //   const payload = {
  //     dev_id: "ice",
  //     leaderboard: leaderboard
  //   };
  //   console.log('Sending to API:', payload);

  //   fetch('https://linkskool.net/api/v1/keybuddy.php', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(payload),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log('API response:', data);
  //     })
  //     .catch((error) => {
  //       console.error('API error:', error);
  //     });
  // }

  function saveLeaderboardToJsonFile() {
    const leaderboard = JSON.parse(
      localStorage.getItem('keybuddyLeaderboard') || '[]'
    );
    localStorage.setItem(
      'keybuddyLeaderboardJson',
      JSON.stringify(leaderboard, null, 2)
    );
    console.log('keybuddyLeaderboardJson:', leaderboard);

    // Send to API
    sendLeaderboardToAPI();
  }
  // Add player to leaderboard
  function addToLeaderboard(score, speed, time) {
    // Get user data
    const userData = JSON.parse(localStorage.getItem('keybuddyUser'));
    if (!userData) return;

    // Load all users
    let leaderboard =
      JSON.parse(localStorage.getItem('keybuddyLeaderboard') || '{}');

    // Calculate accuracy
    const accuracy =
      Math.round((totalCorrectChars / totalTypedChars) * 100) || 100;

    // Update or add the current user's score
    //const idx = leaderboard.findIndex((u) => u.username === userData.username);
    const entry = {
      ...userData,
      username: userData.username,
      full_name: userData.name,
      score: score,
      speed: speed,
      time: time,
      accuracy: accuracy, // Add accuracy here
    };
    delete entry.name;

    let type = 'new';
    if (leaderboard) {
      leaderboard[idx] = entry;
      type = 'update';
    } else {
      leaderboard.push(entry);
      type = 'new';
    }

    // Save updated leaderboard to localStorage
    localStorage.setItem('keybuddyLeaderboard', JSON.stringify(leaderboard));
    leaderboardData = leaderboard;
    // Save type info for API
    localStorage.setItem('keybuddyLeaderboardType', type);
    saveLeaderboardToJsonFile();
  }

function sendLeaderboardToAPI() {
  const leaderboard = JSON.parse(
    localStorage.getItem('keybuddyLeaderboardJson') || '[]'
  );
  const type = localStorage.getItem('keybuddyLeaderboardType') || 'new';

  // Only send the current user (last entry in leaderboard array)

  console.log('leaderboard',leaderboard);
  const user = leaderboard[0];
  console.log(user);
  if (!user) return;

  // // Build the payload in the required flat format
  // const payloadUser = {
  //   ...(type === 'update' && user.id ? { id: user.id } : {}),
  //   accuracy: user.accuracy,
  //   full_name: user.full_name,
  //   type: type,
  //   score: user.score,
  //   speed: user.speed,
  //   time: user.time,
  //   username: user.username
  // };

  // Validation: If any required field is missing, log and return
  const requiredFields = [
    'full_name',
    'username',
    'speed',
    'score',
    'accuracy',
    'type',
    'time'
  ];
  // for (const field of requiredFields) {
  //   if (
  //     payloadUser[field] === '' ||
  //     payloadUser[field] === null ||
  //     payloadUser[field] === undefined
  //   ) {
  //     console.error(`Missing required field: ${field}`, payloadUser);
  //     return;
  //   }
  // }

  // console.log('Sending to API:', payloadUser);

  // fetch('https://linkskool.net/api/v1/keybuddy.php', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(payloadUser),
  // })
  //   .then(async (response) => {
  //     const contentType = response.headers.get('content-type');
  //     if (contentType && contentType.includes('application/json')) {
  //       const data = await response.json();
  //       console.log('API response:', data);
  //     } else {
  //       const text = await response.text();
  //       console.error('API returned non-JSON:', text);
  //     }
  //   })
  //   .catch((error) => {
  //     console.error('API error:', error);
  //   });
}
  // Helper to get or generate a unique device id
  function getDeviceId() {
    let id = localStorage.getItem('keybuddyDeviceId');
    if (!id) {
      id =
        window.crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now();
      localStorage.setItem('keybuddyDeviceId', id);
    }
    return id;
  }

  // Add this function to save leaderboard data as JSON in the required order

  // Show leaderboard
  function showLeaderboard() {
    // Clear existing entries
    leaderboardBody.innerHTML = '';
    const leaderboardCards = document.getElementById('leaderboard-cards');
    if (leaderboardCards) leaderboardCards.innerHTML = '';

    // Sort all users by score descending
    // const sorted = [...leaderboardData].sort(
    //   (a, b) => (b.score || 0) - (a.score || 0)
    // );

    function getAvatarHTML(avatar, size = 56) {
      if (
        typeof avatar === 'string' &&
        avatar.trim().toLowerCase().endsWith('.png')
      ) {
        return `<img src="${avatar}" alt="Avatar" class="avatar-img" style="width:${size}px;height:${size}px;" />`;
      } else {
        return `<div class="avatar-img flex items-center justify-center bg-blue-100 text-blue-600 font-bold" style="width:${size}px;height:${size}px;font-size:1.5rem;">${avatar}</div>`;
      }
    }

    // Helper for rank badge
    function getRankBadge(rank) {
      if (rank === 1) return `<span class="rank-badge gold">Challenger</span>`;
      if (rank === 2) return `<span class="rank-badge silver">Master</span>`;
      if (rank === 3)
        return `<span class="rank-badge bronze">Grandmaster</span>`;
      return `<span class="rank-badge">Gold</span>`;
    }

    // Render cards for top 3 users
    if (leaderboardCards) {
      leaderboardCards.innerHTML = sorted
        .slice(0, 3)
        .map(
          (user, i) => `
        <div class="leaderboard-card">
          <span class="leaderboard-trophy ${
            i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze'
          }"><i class="ri-trophy-line"></i></span>
          ${getAvatarHTML(user.avatar, 56)}
          <div class="leaderboard-rank">#${i + 1}</div>
          <div class="leaderboard-name">${user.name}</div>
          <div class="leaderboard-role">${getRankBadge(i + 1).replace(
            /<[^>]+>/g,
            ''
          )}</div>
          <div class="leaderboard-stats">
            <div>
              <div style="font-weight:600;">Score</div>
              <div>${user.score || 0}</div>
            </div>
            <div>
              <div style="font-weight:600;">Speed</div>
              <div>${user.speed || 0} WPM</div>
            </div>
            <div>
              <div style="font-weight:600;">Time</div>
              <div>${user.time || 0}s</div>
            </div>
          </div>
        </div>
      `
        )
        .join('');
    }

    // Render table rows for all users
    sorted.forEach((user, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>
          ${getAvatarHTML(user.avatar, 36)}
        </td>
        <td>
          <div>
            <span style="font-weight:600;">${user.name}</span>
          </div>
        </td>
        <td>
          <div>
            <span style="font-weight:500;">Score:</span> ${user.score || 0}<br>
            <span style="font-weight:500;">Speed:</span> ${
              user.speed || 0
            } WPM<br>
            <span style="font-weight:500;">Time:</span> ${user.time || 0}s
          </div>
        </td>
        <td>
          ${getRankBadge(i + 1)}
        </td>
      `;
      leaderboardBody.appendChild(row);
    });

    // Show leaderboard modal
    leaderboardModal.classList.remove('hidden');
    // Save the leaderboard as JSON in the required order
    saveLeaderboardToJsonFile();
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
    // Only remove previous suggestion, not all key highlights
    document
      .querySelectorAll('.key-suggest')
      .forEach((k) => k.classList.remove('key-suggest'));
    if (currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex];
      if (currentWord) {
        if (currentTypedWord.length < currentWord.length) {
          // Suggest next character
          const nextChar = currentWord[currentTypedWord.length].toUpperCase();
          const nextKey = getKeyCode(nextChar);
          const nextKeyElement = document.querySelector(
            `[data-key="${nextKey}"]`
          );
          if (nextKeyElement) {
            nextKeyElement.classList.add('key-suggest');
          }
        } else {
          // Suggest space bar when word is complete
          const spaceKey = document.querySelector(`[data-key="Space"]`);
          if (spaceKey) {
            spaceKey.classList.add('key-suggest');
          }
        }
      }
    }
  }

  // --- Place these at the top-level scope ---
  let globalKeydownHandler;
  let level2KeydownHandler;

  // Event listeners
  document.addEventListener('keydown', (e) => {
    if (!gameActive) {
      // Start game on Enter if not active
      if (e.key === 'Enter') {
        startTimer();
      }
      return;
    }

    // Skip for level 5 as it has its own event handler
    if (currentLevel === 5) return;

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
      currentTypedWord = ''; // Clear the current typed word

      // Check if all words are completed
      if (currentWordIndex >= words.length) {
        endLevel();
      } else {
        renderCurrentWordWithInput();
      }
      updateStats();
    } else {
      // Append typed character to the current word
      currentTypedWord += e.key;
      renderCurrentWordWithInput();
      updateKeyboard(e.code, 'pressed');
    }
  });

  // Add event listener for level 5 typing
  function handleLevel5Typing(e) {
    if (currentLevel !== 5 || !gameActive) return;

    if (e.key === ' ') {
      e.preventDefault();
      const typedWord = currentTypedWord.trim().toLowerCase(); // Convert typed word to lowercase
      const currentWord = words[currentWordIndex];
      if (typedWord === '') return;

      // Check if word is correct
      if (typedWord === currentWord) {
        updateWordStatus(currentWordIndex, 'correct');
        correctWords++;
        totalCorrectChars += currentWord.length;

        // Update progress bar for level 5
        const progress = (correctWords / 50) * 100; // Target is 50 words
        progressFill.style.width = `${progress}%`;

        // Check if 50 correct words are typed
        if (correctWords >= 50) {
          endLevel();
          return;
        }
      } else {
        updateWordStatus(currentWordIndex, 'incorrect');
        incorrectWords++;
      }
      totalTypedChars += typedWord.length;
      currentTypedWord = ''; // Reset typed word

      // Move to next word
      currentWordIndex++;
      updateStats();
    } else {
      currentTypedWord += e.key;
    }
  }

  // Attach level 5 typing handler
  document.addEventListener('keydown', handleLevel5Typing);

  // Initialize the current typed word
  let currentTypedWord = '';

  // View leaderboard button
  viewLeaderboardButton.addEventListener('click', showLeaderboard);

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
  const playAgainLeaderboardButton = document.getElementById(
    'play-again-leaderboard'
  );
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
      showCountdownAnimation(() => {
        initGame();
      });
    });
  }

  // Display user info if available
  const user = JSON.parse(localStorage.getItem('keybuddyUser'));
  if (user) {
    // You could add a user info display here if desired
    console.log(`Welcome back, ${user.name}!`);
  }

  // Function to show the level completion modal
  function showLevelCompletionModal(level) {
    const modal = document.getElementById('level-completion-modal');
    const message = document.getElementById('level-completion-message');
    const continueButton = document.getElementById('continue-button');

    // Update the modal message
    message.textContent = `You have successfully completed Level ${level}!`;

    // Show the modal
    modal.classList.remove('hidden');

    // Add event listener to the continue button
    continueButton.onclick = () => {
      modal.classList.add('hidden'); // Hide the modal
      startNextLevel(level + 1); // Start the next level
    };
  }

  // Example function to simulate level completion
  function completeLevel(level) {
    // Simulate level completion logic
    console.log(`Level ${level} completed!`);
    showLevelCompletionModal(level);
  }

  // Example function to start the next level
  function startNextLevel(level) {
    console.log(`Starting Level ${level}...`);
    // Add logic to initialize the next level
  }
});
