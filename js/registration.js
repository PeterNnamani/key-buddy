export default function showRegistrationModal({ saveUserData, makeRequest, showCountDown }) {
  const registrationModal = document.getElementById('registration-modal');
  const feedback = document.getElementById('feedback');
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

      makeRequest({
        payload: formData,
        onSuccess: function (result) {
          if (result.status) {
            const data = result.response;

            formData.id = data.id;
            formData.type = 'update';

            saveUserData(formData);
            localStorage.setItem('has-registered', 'true');
            registrationModal.classList.add('hidden');
            registrationForm.dataset.listenerAttached = 'true';

            showCountDown(4);
          } else {
            feedback.textContent = result.message;
          }
        }
      });
    });
  }
}