// Game state initialization
let gameState = {
    players: [],
    currentPlayer: 0,
    currentPosition: 0,
    daysInMonth: 28,
    started: false,
    showFutureDays: false
};

// Game events configuration
const gameEvents = [
    { type: 'gain', text: 'خود المانضة', amount: 10000 },
    { type: 'loss', text: 'خلّص الكرا', amount: -2000 },
    { type: 'gain', text: 'لقيتي 200 درهم', amount: 200 },
    { type: 'loss', text: ' درتي كصيدا', amount: -1000 },
    { type: 'loss', text: 'خلص الضو و الما ', amount: -500 },
    { type: 'choice', text: 'فرصة استثمار', 
        choices: [
            { text: 'استثمر 1000 درهم', amount: -1000, reward: 2000, chance: 0.7 },
            { text: 'تجنب المخاطرة', amount: 0 }
        ]
    },
    { type: 'choice', text: 'فرصة عمل إضافي',
        choices: [
            { text: 'اقبل العمل', amount: 800 },
            { text: 'استرح مع العائلة', amount: 0 }
        ]
    }
];

// DOM Elements
const elements = {
    setup: document.getElementById('setup'),
    game: document.getElementById('game'),
    playerCount: document.getElementById('playerCount'),
    playerNames: document.getElementById('playerNames'),
    startGame: document.getElementById('startGame'),
    board: document.getElementById('board'),
    playerStats: document.getElementById('playerStats'),
    dice: document.getElementById('dice'),
    rollDice: document.getElementById('rollDice'),
    choices: document.getElementById('choices'),
    gameHistory: document.getElementById('gameHistory'),
    themeToggle: document.getElementById('themeToggle')
};

// Helper function to get player color
function getPlayerColor(id) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];
    return colors[id % colors.length];
}

// Theme Toggle
elements.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

// Toggle future days visibility
function toggleFutureDays() {
    gameState.showFutureDays = !gameState.showFutureDays;
    renderBoard();
}

// Generate player name inputs
elements.playerCount.addEventListener('change', () => {
    const count = parseInt(elements.playerCount.value);
    elements.playerNames.innerHTML = Array.from({ length: count }, (_, i) => `
        <div>
            <label class="block mb-2">اسم اللاعب ${i + 1}:</label>
            <input type="text" class="w-full p-2 border rounded" id="player${i}" 
                   placeholder="اللاعب ${i + 1}">
        </div>
    `).join('');
});

// Start game
elements.startGame.addEventListener('click', () => {
    const playerInputs = document.querySelectorAll('#playerNames input');
    gameState.players = Array.from(playerInputs).map((input, i) => ({
        id: i,
        name: input.value || `اللاعب ${i + 1}`,
        balance: 10000,
        position: 0
    }));

    elements.setup.classList.add('hidden');
    elements.game.classList.remove('hidden');
    gameState.started = true;
    
    renderBoard();
    renderPlayerStats();
    addToHistory('بداية اللعبة');
    updateWinningProbabilities();
});

// Render board
function renderBoard() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const maxVisibleDay = gameState.showFutureDays ? gameState.daysInMonth : currentPlayer.position + 1;

    elements.board.innerHTML = Array.from({ length: gameState.daysInMonth }, (_, i) => {
        const week = Math.floor(i / 7);
        const playersHere = gameState.players.filter(p => p.position === i);
        const isAnyPlayerHere = playersHere.length > 0;
        const isFutureDay = i > maxVisibleDay;
        
        const event = gameEvents[Math.floor(Math.random() * gameEvents.length)];
        
        const playerIndicators = playersHere.map(p => `
            <div class="player-indicator" style="background-color: ${getPlayerColor(p.id)}">
                ${p.name[0]}
            </div>
        `).join('');

        return `
            <div class="game-tile ${isAnyPlayerHere ? 'active' : ''} 
                        ${event.type === 'gain' ? 'gain' : event.type === 'loss' ? 'loss' : ''}
                        ${isFutureDay ? 'future-day' : ''}"
                 ${isFutureDay ? 'aria-hidden="true"' : ''}>
                <div class="font-bold">يوم ${i + 1}</div>
                <div class="text-sm">أسبوع ${week + 1}</div>
                <div class="text-sm mt-2 ${isFutureDay ? 'blur-text' : ''}">${event.text}</div>
                <div class="player-indicators flex gap-1 mt-2">
                    ${playerIndicators}
                </div>
            </div>
        `;
    }).join('');

    // Update current day in header
    const currentDayElement = document.getElementById('currentDay');
    if (currentDayElement) {
        currentDayElement.querySelector('span').textContent = currentPlayer.position + 1;
    }
}

// Render player stats
function renderPlayerStats() {
    elements.playerStats.innerHTML = gameState.players.map(player => `
        <div class="p-4 bg-white rounded-lg shadow ${player.id === gameState.currentPlayer ? 'border-2 border-blue-500' : ''}">
            <h3 class="font-bold">${player.name}</h3>
            <p class="${player.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${player.balance} درهم
            </p>
        </div>
    `).join('');
}

// Update winning probabilities
function updateWinningProbabilities() {
    const totalBalance = gameState.players.reduce((sum, p) => sum + Math.max(0, p.balance), 0);
    
    const probabilitiesHtml = gameState.players
        .map(player => {
            const probability = totalBalance === 0 ? 
                (100 / gameState.players.length) : 
                ((Math.max(0, player.balance) / totalBalance) * 100);
            
            const isLeading = player.balance === Math.max(...gameState.players.map(p => p.balance));
            
            return {
                player,
                probability,
                isLeading
            };
        })
        .sort((a, b) => b.probability - a.probability)
        .map(({ player, probability, isLeading }) => `
            <div class="probability-bar mb-2">
                <div class="flex justify-between mb-1">
                    <span class="${isLeading ? 'font-bold text-yellow-500' : ''}">${player.name}</span>
                    <span>${probability.toFixed(1)}%</span>
                </div>
                <div class="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div class="h-2.5 rounded-full transition-all duration-500 ${isLeading ? 'leading-player' : ''}"
                         style="width: ${probability}%; background-color: ${getPlayerColor(player.id)}">
                    </div>
                </div>
            </div>
        `).join('');

    let probContainer = document.getElementById('winningProbabilities');
    if (!probContainer) {
        probContainer = document.createElement('div');
        probContainer.id = 'winningProbabilities';
        probContainer.className = 'mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow';
        elements.gameHistory.after(probContainer);
    }
    
    probContainer.innerHTML = `
        <h3 class="font-bold mb-3">احتمالات الفوز</h3>
        ${probabilitiesHtml}
    `;
}

// Roll dice
elements.rollDice.addEventListener('click', async () => {
    if (!gameState.started || elements.rollDice.disabled) return;
    
    elements.rollDice.disabled = true;
    elements.dice.classList.add('rolling');
    
    const delay = 1000 + Math.random() * 1000;
    const result = Math.floor(Math.random() * 6) + 1;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    elements.dice.classList.remove('rolling');
    elements.dice.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][result - 1];
    
    handleTurn(result);
});

// Handle turn
function handleTurn(steps) {
    const player = gameState.players[gameState.currentPlayer];
    const newPosition = Math.min(player.position + steps, gameState.daysInMonth - 1);
    const event = gameEvents[Math.floor(Math.random() * gameEvents.length)];

    player.position = newPosition;
    gameState.currentPosition = newPosition;

    if (event.type === 'choice') {
        showChoices(event);
    } else {
        handleEvent(event);
    }

    renderBoard();
    renderPlayerStats();
    
    if (newPosition >= gameState.daysInMonth - 1) {
        endGame();
        return;
    }

    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    elements.rollDice.disabled = false;
}

// Handle event
function handleEvent(event) {
    const player = gameState.players[gameState.currentPlayer];
    player.balance += event.amount || 0;
    
    addToHistory(`${player.name}: ${event.text} (${event.amount > 0 ? '+' : ''}${event.amount} درهم)`);
    updateWinningProbabilities();
}

// Show choices
function showChoices(event) {
    elements.choices.classList.remove('hidden');
    const buttons = elements.choices.querySelectorAll('.choice');
    
    buttons.forEach((btn, i) => {
        const choice = event.choices[i];
        btn.textContent = choice.text;
        
        btn.onclick = () => {
            handleChoice(choice);
            elements.choices.classList.add('hidden');
        };
    });
}

// Handle choice
function handleChoice(choice) {
    const player = gameState.players[gameState.currentPlayer];
    let amount = choice.amount;
    
    if (choice.chance && Math.random() < choice.chance) {
        amount += choice.reward;
    }
    
    player.balance += amount;
    addToHistory(`${player.name} اختار: ${choice.text} (${amount > 0 ? '+' : ''}${amount} درهم)`);
    updateWinningProbabilities();
}

// Add to history
function addToHistory(message) {
    const player = gameState.players[gameState.currentPlayer];
    const day = player ? player.position + 1 : null;
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item p-2 border-b';
    
    if (day) {
        historyItem.innerHTML = `
            <span class="day-indicator">يوم ${day}</span>
            <span class="message">${message}</span>
        `;
    } else {
        historyItem.textContent = message;
    }
    
    elements.gameHistory.insertBefore(historyItem, elements.gameHistory.firstChild);
    updateWinningProbabilities();
}

// End game
function endGame() {
    const winner = gameState.players.reduce((max, player) => 
        player.balance > max.balance ? player : max
    );
    
    addToHistory(`انتهت اللعبة! الفائز هو: ${winner.name} برصيد ${winner.balance} درهم!`);
    elements.rollDice.disabled = true;
}

// Initialize
elements.playerCount.dispatchEvent(new Event('change'));
