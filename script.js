const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.isRed = suit === '♥' || suit === '♦';
    }
    
    getVisual() {
        return `<div class="card card-face ${this.isRed ? 'red' : ''}">
            <div style="position:absolute; top:8px; left:8px; font-size:1.2rem; line-height:1;">${this.value}<br>${this.suit}</div>
            <div style="font-size:4rem;">${this.suit}</div>
            <div style="position:absolute; bottom:8px; right:8px; font-size:1.2rem; line-height:1; transform:rotate(180deg);">${this.value}<br>${this.suit}</div>
        </div>`;
    }
}

let p1Deck = [];
let p2Deck = [];
let middlePile = [];

let currentTurn = 1; // 1 or 2
let faceCardState = {
    active: false,
    target: null, // who is currently forced to play
    owner: null,  // who placed the face card
    chancesLeft: 0
};

let gameActive = true;

const messageOverlay = document.getElementById('message-overlay');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Simple sound synthesis
function playSound(type) {
    if (audioContext.state === 'suspended') audioContext.resume();
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'play') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    } else if (type === 'slap') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        osc.start();
        osc.stop(audioContext.currentTime + 0.2);
    } else if (type === 'bad') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    }
}

function initGame() {
    let deck = [];
    for(let suit of SUITS) {
        for(let val of VALUES) {
            deck.push(new Card(suit, val));
        }
    }
    
    for(let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    p1Deck = deck.slice(0, 26);
    p2Deck = deck.slice(26);
    middlePile = [];
    currentTurn = 1;
    faceCardState = { active: false, target: null, owner: null, chancesLeft: 0 };
    gameActive = true;
    
    updateUI();
    showMessage("Game Start! P1 Turn", false);
}

function showMessage(msg, isLong = false) {
    messageOverlay.innerText = msg;
    messageOverlay.classList.remove('show', 'long-show');
    void messageOverlay.offsetWidth; // trigger reflow
    messageOverlay.classList.add(isLong ? 'long-show' : 'show');
}   

function updateUI() {
    document.getElementById('p1-count').innerText = p1Deck.length;
    document.getElementById('p2-count').innerText = p2Deck.length;
    document.getElementById('pile-count').innerText = middlePile.length;
    
    document.getElementById('player-1').classList.toggle('active', currentTurn === 1);
    document.getElementById('player-2').classList.toggle('active', currentTurn === 2);
    
    const display = document.getElementById('card-display');
    display.innerHTML = '';
    
    const cardsToShow = Math.min(middlePile.length, 5);
    for(let i = 0; i < cardsToShow; i++) {
        let card = middlePile[middlePile.length - cardsToShow + i];
        let cardEl = document.createElement('div');
        cardEl.innerHTML = card.getVisual();
        let el = cardEl.firstElementChild;
        // Random rotation for realism
        let rot = (Math.random() - 0.5) * 20;
        let transX = (Math.random() - 0.5) * 10;
        let transY = (Math.random() - 0.5) * 10;
        el.style.transform = `rotate(${rot}deg) translate(${transX}px, ${transY}px)`;
        display.appendChild(el);
    }
}

function getFaceCardChances(value) {
    if(value === 'J') return 1;
    if(value === 'Q') return 2;
    if(value === 'K') return 3;
    if(value === 'A') return 4;
    return 0;
}

function checkFaceCardFail() {
    if(!faceCardState.active) return;
    
    let targetDeck = faceCardState.target === 1 ? p1Deck : p2Deck;
    if(targetDeck.length === 0) {
        let winnerDeck = faceCardState.owner === 1 ? p1Deck : p2Deck;
        winnerDeck.push(...middlePile);
        middlePile = [];
        showMessage(`P${faceCardState.owner} Won Pile!`);
        currentTurn = faceCardState.owner;
        faceCardState.active = false;
        updateUI();
        checkWinCondition();
    }
}

function playCard(playerNum) {
    if(!gameActive) return;
    if(currentTurn !== playerNum) {
        showMessage(`Not Your Turn!`);
        return;
    }
    
    let deck = playerNum === 1 ? p1Deck : p2Deck;
    if(deck.length === 0) {
        checkFaceCardFail();
        return;
    }
    
    playSound('play');
    let card = deck.shift();
    middlePile.push(card);
    
    let chances = getFaceCardChances(card.value);
    
    if(chances > 0) {
        faceCardState.active = true;
        faceCardState.owner = playerNum;
        faceCardState.target = playerNum === 1 ? 2 : 1;
        faceCardState.chancesLeft = chances;
        currentTurn = faceCardState.target;
        showMessage(`Face Card! P${faceCardState.target} place ${chances}`, true);
        checkFaceCardFail(); // Check immediately if target has 0 cards
    } else {
        if(faceCardState.active) {
            faceCardState.chancesLeft--;
            if(faceCardState.chancesLeft === 0) {
                let winnerDeck = faceCardState.owner === 1 ? p1Deck : p2Deck;
                winnerDeck.push(...middlePile);
                middlePile = [];
                showMessage(`P${faceCardState.owner} Won Pile!`);
                currentTurn = faceCardState.owner; 
                faceCardState.active = false;
            } else {
                currentTurn = faceCardState.target;
            }
        } else {
            // Check if other player is dead, skip their turn if dead
            let nextTurn = playerNum === 1 ? 2 : 1;
            let nextDeck = nextTurn === 1 ? p1Deck : p2Deck;
            if(nextDeck.length === 0) {
                currentTurn = playerNum; // They keep playing
            } else {
                currentTurn = nextTurn;
            }
        }
    }
    
    updateUI();
    checkWinCondition();
}

function canSlap() {
    if (middlePile.length < 2) return false;
    
    const top = middlePile[middlePile.length - 1];
    const second = middlePile[middlePile.length - 2];
    
    if (top.value === second.value) return true;
    
    if (middlePile.length >= 3) {
        const third = middlePile[middlePile.length - 3];
        if (top.value === third.value) return true;
    }
    
    return false;
}

function slap(playerNum) {
    if(!gameActive) return;
    
    const middleEl = document.getElementById('card-display');
    
    if (canSlap()) {
        playSound('slap');
        middleEl.classList.add('slap-animation');
        setTimeout(() => middleEl.classList.remove('slap-animation'), 400);
        
        showMessage(`SLAP! P${playerNum} gets pile!`, true);
        let winnerDeck = playerNum === 1 ? p1Deck : p2Deck;
        winnerDeck.push(...middlePile);
        middlePile = [];
        currentTurn = playerNum;
        faceCardState.active = false;
    } else {
        playSound('bad');
        let deck = playerNum === 1 ? p1Deck : p2Deck;
        if(deck.length > 0) {
            let card = deck.shift();
            middlePile.unshift(card); 
            showMessage(`Bad Slap! P${playerNum} burns a card`);
        }
    }
    updateUI();
    checkWinCondition();
}

function checkWinCondition() {
    if (p1Deck.length === 0 && middlePile.length === 0) {
        showMessage("PLAYER 2 WINS THE GAME!", true);
        gameActive = false;
        document.getElementById('player-2').classList.add('active');
        document.getElementById('player-1').classList.remove('active');
    } else if (p2Deck.length === 0 && middlePile.length === 0) {
        showMessage("PLAYER 1 WINS THE GAME!", true);
        gameActive = false;
        document.getElementById('player-1').classList.add('active');
        document.getElementById('player-2').classList.remove('active');
    }
}

// Controls
window.addEventListener('keydown', (e) => {
    if(!gameActive) return;
    let key = e.key.toLowerCase();
    
    if (key === 'q') playCard(1);
    if (key === 'w') slap(1);
    
    if (key === 'o') playCard(2);
    if (key === 'p') slap(2);
});

// Click Controls
document.getElementById('btn-p1-play').addEventListener('click', () => playCard(1));
document.getElementById('btn-p1-slap').addEventListener('click', () => slap(1));
document.getElementById('btn-p2-play').addEventListener('click', () => playCard(2));
document.getElementById('btn-p2-slap').addEventListener('click', () => slap(2));

// Additional intuitive click controls
document.getElementById('p1-deck-click').addEventListener('click', () => playCard(1));
document.getElementById('p2-deck-click').addEventListener('click', () => playCard(2));

// Slap anywhere in middle
document.getElementById('middle-pile').addEventListener('click', (e) => {
    // If middle pile is clicked, who slapped? 
    // Usually mobile devices use the explicit buttons. 
    // For desktop, it's hard to distinguish click. 
    // We can assume the current playing user or just rely on keyboard/buttons.
});

// Start
initGame();
