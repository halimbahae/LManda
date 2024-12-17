const setupDiv = document.getElementById("setup");
const gameDiv = document.getElementById("game");
const startGameBtn = document.getElementById("startGame");
const playersInput = document.getElementById("players");
const playerStatsDiv = document.getElementById("playerStats");
const boardDiv = document.getElementById("board");
const turnIndicator = document.getElementById("turnIndicator");
const rollDiceBtn = document.getElementById("rollDice");
const diceResult = document.getElementById("diceResult");
const spinner = document.getElementById("spinner");

let players = [];
let currentPlayer = 0;
let currentDay = 0;
const totalDays = 30;

// Game board setup
const board = Array.from({ length: totalDays }, (_, i) => ({
  day: i + 1,
  event: randomEvent()
}));

// Random events
function randomEvent() {
  const events = [
    "مانضة: خذ راتبك",
    "صدفة: لقيتي 200 درهم",
    "مصاريف: خلّص الكرا 2000 درهم",
    "صدفة: صابتك سيارة، خلص 1000 درهم",
    "مصاريف: ضو وميه 500 درهم",
    "صدفة: عيد الأضحى، خلص 3000 درهم",
    "مصاريف: الأنترنيت 200 درهم",
    "صدفة: خالك عيط عليك، نهار بلا مصاريف",
    "مصاريف: قهوة 150 درهم"
  ];
  return events[Math.floor(Math.random() * events.length)];
}

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
  updateTurnIndicator();
}

function renderPlayerStats() {
  playerStatsDiv.innerHTML = players
    .map(
      (player) =>
        `<div class="p-4 border rounded bg-white">
          <h3 class="font-bold">${player.name}</h3>
          <p>الرصيد: ${player.balance} درهم</p>
        </div>`
    )
    .join("");
}

function renderBoard() {
  boardDiv.innerHTML = board
    .map(
      (tile, i) =>
        `<div class="p-4 border rounded ${
          currentDay === i ? "bg-yellow-300" : "bg-gray-200"
        } text-sm text-gray-800">
          ${tile.day}. ${tile.event}
        </div>`
    )
    .join("");
}

function updateTurnIndicator() {
  turnIndicator.textContent = `الدور ديال: ${players[currentPlayer].name}`;
}

rollDiceBtn.addEventListener("click", () => {
  spinner.classList.remove("hidden");

  // Simulate spinning the dice
  setTimeout(() => {
    spinner.classList.add("hidden");
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    diceResult.textContent = `زهر اللعب: ${diceRoll}`;
    movePlayer(diceRoll);
  }, 2000);
});

function movePlayer(steps) {
  const player = players[currentPlayer];

  // Update player position
  player.position = Math.min(player.position + steps, totalDays - 1);
  currentDay = player.position;

  // Handle board event
  const event = board[player.position].event;
  handleEvent(player, event);

  // Update UI
  renderPlayerStats();
  renderBoard();

  // Check if it's the last day
  if (currentDay === totalDays - 1) {
    endGame();
    return;
  }

  // Move to next player
  currentPlayer = (currentPlayer + 1) % players.length;
  updateTurnIndicator();
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

function endGame() {
  rollDiceBtn.disabled = true;
  const winner = players.reduce((max, player) =>
    player.balance > max.balance ? player : max
  );
  alert(`انتهات اللعبة! الفائز هو: ${winner.name} برصيد ${winner.balance} درهم!`);
}
