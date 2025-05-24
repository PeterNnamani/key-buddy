import makeRequest from "./request.js";

export default function showLeaderboard(){
    makeRequest({
        method: 'GET',
        onSuccess: function (result) {
            if (result.status) {
                populateLeaderboard(result.response);
            }
        }
    });
}

function populateLeaderboard(results) {
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboardCards = document.getElementById('leaderboard-cards');

    leaderboardBody.innerHTML = '';
    if (leaderboardCards) leaderboardCards.innerHTML = '';

    // CASE 1: More than 3 results – show top 3 as cards
    if (results.length > 3) {
        const top3 = results.slice(0, 3);

        // Sort for display: 2nd, 1st, 3rd (so first appears in middle)
        const cardOrder = [top3[1], top3[0], top3[2]];

        leaderboardCards.innerHTML = cardOrder
        .map((user, i) => {
          const realRank = results.indexOf(user) + 1;
      
          return `
            <div class="w-64 bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center relative border-2 ${
              realRank === 1 ? 'border-yellow-400 scale-105' : 'border-gray-100'
            } transition-transform duration-300 ease-in-out">
              <span class="absolute -top-4 right-4 text-xl ${
                realRank === 1
                  ? 'text-yellow-400'
                  : realRank === 2
                  ? 'text-gray-400'
                  : 'text-orange-400'
              }">
                <i class="ri-trophy-line"></i>
              </span>
              ${getAvatarHTML(user.avatar, 72)}
              <div class="text-xl font-bold mt-3 text-gray-800">#${realRank}</div>
              <div class="text-lg font-semibold text-blue-700">${user.username}</div>
              <div class="text-sm text-gray-500 mb-2">${getRankBadge(realRank).replace(/<[^>]+>/g, '')}</div>
              <div class="w-full grid grid-cols-3 text-center mt-4 gap-2">
                <div>
                  <div class="text-xs font-semibold text-gray-500">Score</div>
                  <div class="text-base font-medium text-gray-800">${user.score || 0}</div>
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-500">Speed</div>
                  <div class="text-base font-medium text-gray-800">${user.speed || 0} WPM</div>
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-500">Time</div>
                  <div class="text-base font-medium text-gray-800">${user.time || 0}s</div>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
      

        // Add remaining (4th and beyond) to table
        results.slice(3).forEach((user, i) => {
            const rank = i + 4;
            leaderboardBody.appendChild(createTableRow(user, rank));
        });

    } else {
        // CASE 2: 3 or fewer users – show all in table
        results.forEach((user, i) => {
            const rank = i + 1;
            leaderboardBody.appendChild(createTableRow(user, rank));
        });
    }

    leaderboardModal.classList.remove('hidden');
}

// Table row generator: one data per column
function createTableRow(user, rank) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>#${rank}</td>
        <td>${getAvatarHTML(user.avatar, 36)}</td>
        <td>${user.username}</td>
        <td>${user.score || 0}</td>
        <td>${user.speed || 0} WPM</td>
        <td>${user.time || 0}s</td>
        <td>${getRankBadge(rank)}</td>
    `;
    return row;
}

function getAvatarHTML(avatar, size = 56) {
    if (typeof avatar === 'string' && avatar.trim().toLowerCase().endsWith('.png')) {
        return `<img src="assets/avatar/${avatar}" alt="Avatar" class="avatar-img" style="width:${size}px;height:${size}px;" />`;
    } else {
        return `<div class="avatar-img flex items-center justify-center bg-blue-100 text-blue-600 font-bold" style="width:${size}px;height:${size}px;font-size:1.5rem;">${avatar}</div>`;
    }
}

function getRankBadge(rank) {
    if (rank === 1) return `<span class="rank-badge gold">Challenger</span>`;
    if (rank === 2) return `<span class="rank-badge silver">Master</span>`;
    if (rank === 3) return `<span class="rank-badge bronze">Grandmaster</span>`;
    return `<span class="rank-badge">Gold</span>`;
}
