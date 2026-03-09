# Red Slap

**By Jan and Cynthia**

Red Slap is a fast-paced, 2-player competitive card game built with HTML, CSS, and modern JavaScript. Known in some circles as Egyptian Rat Screw or Ratslap, this web-based adaptation features glowing neon aesthetics, built-in sound effects, and intuitive keyboard/touch controls.

## Features
- **Aesthetic**: Premium glassmorphism design with a glowing red aesthetic and fluid animations.
- **Responsive**: Playable on desktop and mobile devices.
- **Sound Effects**: Simple web-audio generated sound cues for gameplay feedback.
- **Rules Integrated**: Face cards (J, Q, K, A) have varying chances to force the other player out, and players can win the pile via strategic slaps.

## How to Play

### Setup
The standard 52-card deck is split evenly. Each player starts with 26 cards.

### Controls
You can play using your mouse/touchscreen by pressing the on-screen buttons, or use the keyboard:
- **Player 1 (Bottom)**: 
  - Play Card: `Q`
  - Slap Pile: `W`
- **Player 2 (Top)**:
  - Play Card: `O`
  - Slap Pile: `P`

### General Rules
1. Players take turns playing one card face up in the middle.
2. If a player plays a **Face Card**, the other player must play a specific number of cards to counter:
    - **Jack (J)**: 1 Card
    - **Queen (Q)**: 2 Cards
    - **King (K)**: 3 Cards
    - **Ace (A)**: 4 Cards
3. If the targeted player fails to put down another face card within their chances, the player who played the original face card wins the entire pile!
4. If the targeted player *does* put down a face card, the advantage switches, and the first player must now counter *that* face card.

### Slapping Rules
Anyone can slap the pile to win all the cards currently in the middle, regardless of whose turn it is, under the following conditions:
- **Double**: Two cards of the same value are played back-to-back (e.g., a `5` and then another `5`).
- **Sandwich**: Two cards of the same value separated by one other card (e.g., a `7`, then a `2`, then another `7`).

*Be careful!* Slapping at the wrong time (when there is no Double or Sandwich) comes at a cost: you will burn a card from your deck by sliding it to the bottom of the pile. 

### Winning
The goal is to collect all 52 cards. The player who takes all the cards from their opponent wins the game!

## Installation & Running Locally

1. Clone or download this project folder (`RedSlap`).
2. Open `index.html` in your preferred modern web browser. 
3. Start playing immediately! No server required.

## Technologies Used
- HTML5
- CSS3 (Custom variables, flexbox, animations, glassmorphism)
- Vanilla JavaScript (ES6+ classes, Web Audio API)
