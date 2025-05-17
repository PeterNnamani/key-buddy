export default function showCountdownAnimation(callback) {
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

export function saveUserData(userData) {
    const userDataString = JSON.stringify(userData);
    localStorage.setItem('user-data', userDataString);
}
