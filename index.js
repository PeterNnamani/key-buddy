document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value.trim();
    const leaderboardData = JSON.parse(localStorage.getItem("keybuddyLeaderboard")) || [];

    // Check if the username exists in the leaderboard
    const user = leaderboardData.find((user) => user.username === username);

    if (user) {
      // Save the user data to localStorage as the current user
      localStorage.setItem("keybuddyUser", JSON.stringify(user));

      // Redirect to the game
      window.location.href = "KEYBUDDY-Typing-Challenge.html";
    } else {
      alert("Username not found. Please register as a new player.");
    }
  });
});