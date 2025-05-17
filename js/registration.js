export default function showRegistrationModal({ showCountDown }) {
  const registrationModal = document.getElementById('registration-modal');
  const registrationForm = registrationModal.querySelector('#registration-form');
  const avatarOptions = registrationModal.querySelectorAll('.avatar-option');
  const selectedAvatarInput = registrationModal.querySelector('#selected-avatar');
  registrationModal.classList.remove('hidden');

  // Avatar selection
  avatarOptions.forEach((option) => {
    option.onclick = function () {
      avatarOptions.forEach((opt) => opt.classList.remove('selected'));
      this.classList.add('selected');
      selectedAvatarInput.value = this.dataset.avatar;
    };
  });

  // Registration form submit
  if (!registrationForm.dataset.listenerAttached) {
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = {
        id: 0,
        full_name: registrationModal.querySelector('#name').value,
        username: registrationModal.querySelector('#username').value,
        avatar: registrationModal.querySelector('#selected-avatar').value,
        score: 0,
        speed: 0,
        time: 0,
        accuracy: 0,
        type: 'new',
      };

      console.log('Form data ', formData);
      localStorage.setItem('user-data', JSON.stringify(formData));
      localStorage.setItem('has-registered', 'true');
      registrationModal.classList.add('hidden');

      // Immediately continue to level 4 after registration
      //  const currentLevel = 4;
      showCountDown(4)
    });
    registrationForm.dataset.listenerAttached = 'true';
  }
}