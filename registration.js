document.addEventListener('DOMContentLoaded', () => {
  // Check if a user is already registered
  const existingUser = localStorage.getItem('keybuddyUser');
  if (existingUser) {
    alert('You are already registered. Redirecting to the game...');
    window.location.href = 'KEYBUDDY-Typing-Challenge.html';
    return;
  }

  // Avatar selection functionality
  const avatarOptions = document.querySelectorAll('.avatar-option');
  const selectedAvatarInput = document.getElementById('selected-avatar');

  avatarOptions.forEach((option) => {
    option.addEventListener('click', function () {
      // Remove selected class from all options
      avatarOptions.forEach((opt) => opt.classList.remove('selected'));

      // Add selected class to clicked option
      this.classList.add('selected');

      // Update hidden input value
      selectedAvatarInput.value = this.dataset.avatar;
    });
  });

  // Form submission
  const registrationForm = document.getElementById('registration-form');

  registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
      name: document.getElementById('name').value,
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      avatar: document.getElementById('selected-avatar').value,
      totalScore: 0, // Initialize total score
      totalSpeed: 0, // Initialize total speed
      totalTime: 0, // Initialize total time
    };

    // Save user data to localStorage
    localStorage.setItem('keybuddyUser', JSON.stringify(formData));

    // Set flag to start from level 4
    localStorage.setItem('startFromLevel', '4');

    // Redirect to game page and start from level 4
    window.location.href = 'KEYBUDDY-Typing-Challenge.html';
  });
});
