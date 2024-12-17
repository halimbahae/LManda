const setupDiv = document.getElementById("setup");
const gameDiv = document.getElementById("game");
const startGameBtn = document.getElementById("startGame");
const playersInput = document.getElementById("players");
const playerStatsDiv = document.getElementById("playerStats");
const rollDiceBtn = document.getElementById("rollDice");
const diceResult = document.getElementById("diceResult");

let players = [];
let currentPlayer = 0;

// Game board setup
const board = [
  "مانضة: خذ راتبك",
  "صدفة: لقيتي 200 درهم",
  "مصاريف: خلّص الكرا 2000 درهم",
  "صدفة: صابتك سيارة، خلص 1000 درهم",
  "مصاريف: ضو وميه 500 درهم",
  "صدفة: عيد الأضحى، خلص 3000 درهم",
  "مصاريف: الأنترنيت 200 درهم",
  "صدفة: خالك عيط عليك، نهار بلا مصاريف",
  "مصاريف: قهوة 150 درهم",
  "مانضة: خذ راتبك"
];

// Start game
startGameBtn.addEventListener("click", () => {
  const numPlayers = parseInt(playersInput.value);

  if (numPlayers < 2 || numPlayers > 6) {
    alert("عدد اللاعبين لازم يكون بين 2 و 6.");
    return;
  }

  setupGame(numPlayers);
});

function setupGame(numPlayers) {
  setupDiv.classList.add("hidden");
  gameDiv.classList.remove("hidden");

  // Initialize players
  players = Array.from({ length: numPlayers }, (_, i) => ({
    id: i,
    name: `لاعب ${i + 1}`,
    balance: 5000, // Starting balance
    position: 0 // Starting position
  }));

  renderPlayerStats();
  renderBoard();
}

function renderPlayerStats() {
  playerStatsDiv.innerHTML = players
    .map(
      (player) =>
        `<div class="p-4 border rounded bg-white">
          <h3 class="font-bold">${player.name}</h3>
          <p>الرصيد: ${player.balance} درهم</p>
          <p>الموقع: ${player.position}</p>
        </div>`
    )
    .join("");
}

function renderBoard() {
  const boardDiv = gameDiv.querySelector(".grid");
  boardDiv.innerHTML = board
    .map(
      (tile, i) =>
        `<div class="p-4 border rounded bg-gray-200 text-sm text-gray-800">
          ${i + 1}. ${tile}
        </div>`
    )
    .join("");
}

rollDiceBtn.addEventListener("click", () => {
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  diceResult.textContent = `زهر اللعب: ${diceRoll}`;
  movePlayer(diceRoll);
});

function movePlayer(steps) {
  const player = players[currentPlayer];

  // Update player position
  player.position = (player.position + steps) % board.length;

  // Handle board event
  const event = board[player.position];
  handleEvent(player, event);

  // Update UI
  renderPlayerStats();

  // Move to next player
  currentPlayer = (currentPlayer + 1) % players.length;
}

function handleEvent(player, event) {
  if (event.includes("مانضة")) {
    player.balance += 5000; // Salary
  } else if (event.includes("لقيتي 200 درهم")) {
    player.balance += 200;
  } else if (event.includes("خلّص الكرا")) {
    player.balance -= 2000;
  } else if (event.includes("صابتك سيارة")) {
    player.balance -= 1000;
  } else if (event.includes("ضو وميه")) {
    player.balance -= 500;
  } else if (event.includes("عيد الأضحى")) {
    player.balance -= 3000;
  } else if (event.includes("الأنترنيت")) {
    player.balance -= 200;
  } else if (event.includes("نهار بلا مصاريف")) {
    // No change
  } else if (event.includes("قهوة")) {
    player.balance -= 150;
  }
}
