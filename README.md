[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/H6lPFq0J)
# Computing 2 Coursework Submission.
**Mayli Jones**
**CID**: 02380832

## Quorridors

Quorridors is a two-player turn-based strategy game played on a 9x9 grid, based on Quoridor. Blue Hexagon and Orange Triangle start on opposite sides of the board and race to reach the far side first.

### How to Play
Sound is not required. The game can be played with the mouse or the keyboard.

On each turn, a player either moves their piece or places a wall:
- **Move**: click your piece, then click a highlighted destination square, or use the arrow keys to navigate and Enter/Space to confirm.
- **Place a wall**: click Horizontal or Vertical in the side panel, or press H/V. Move the wall into position, then click or press Enter to place it. Press R to rotate.

A wall cannot be placed if it would completely block either player from reaching their goal line. Invalid placements are shown in red with a short explanation.

Play locally with **Play with Friend**, or against the computer with **Play with AI**, which has three difficulty levels: Easy, Hard and Impossible.

### Features
- Two-player turn-based gameplay, local or against AI
- Three AI difficulty levels using minimax with alpha-beta pruning
- Live moves-to-win counter and leader indicator for each player
- Full keyboard support: arrow-key navigation, Enter/Space actions, screen reader labels and live announcements
- Responsive layout for different screen sizes
- Rules modal available from the start screen

### UX Design
Visual design was created in Figma, then implemented in CSS (layout, colours, buttons, panels) and in JavaScript using the Canvas 2D API (board, pawns, walls, and shape icons, drawn programmatically rather than as images). No AI-generated visuals or assets were used.

### Accessibility
Checked using axe DevTools and Firefox's built-in Accessibility panel, across several game states: start screen, in-game, wall-placement mode, and game-over screen. Issues found (contrast, decorative canvas labelling, dialog focus management) were fixed and re-checked.

### Modules
- `web-app/game.js` — pure game logic: state, legal moves, win conditions
- `web-app/ai.js` — AI opponent, built using `game.js`'s own functions
- `web-app/main.js` — browser interface, references the game module without reimplementing its rules
- `web-app/tests/game.test.js` — unit tests

### Unit Tests
Tests are split across four aspects of the game module:
- Movement and jumping legality: orthogonal moves, board edges, straight and diagonal jumps
- Wall placement legality: overlaps, path-blocking, `has_path`
- State transitions: `Quoridor.move` — position updates, wall counts, turn switching, purity
- Win conditions: `is_ended`, `winner`

Property-based tests were also written using fast-check, covering key invariants: move bounds, wall placements preserving both players' paths, consistency between `has_path` and `shortest_path_length`, and state immutability. Each property test was verified by temporarily introducing a matching bug into the game logic and confirming the test failed, then reverting it.

### Installation
Run `npm install` in the root directory to install dependencies: ramda, mocha and fast-check.

### AI Acknowledgement
I used Claude by Anthropic for planning and debugging support. All code and game behaviour were reviewed and tested by me before being included in the final submission.

---

This is the submission template for your Computing 2 Applications coursework submission.

## Checklist
### Install dependencies locally
This template relies on a a few packages from the Node Package Manager, npm.
To install them run the following commands in the terminal.
```properties
npm install
```
These won't be uploaded to your repository because of the `.gitignore`.
I'll run the same commands when I download your repos.

### Game Module – API
*You will produce an API specification, i.e. a list of function names and their signatures, for a Javascript module that represents the state of your game and the operations you can perform on it that advances the game or provides information.*

- [ ] Include a `.js ` module file in `/web-app` containing the API using `jsdoc`.
- [ ] Update `/jsdoc.json` to point to this module in `.source.include` (line 7)
- [ ] Compile jsdoc using the run configuration `Generate Docs`
- [ ] Check the generated docs have compiled correctly.

### Game Module – Implementation
*You will implement, in Javascript, the module you specified above. Such that your game can be simulated in code, e.g. in the debug console.*

- [ ] The file above should be fully implemented.

### Unit Tests – Specification
*For the Game module API you have produced, write a set of unit tests descriptions that specify the expected behaviour of one aspect of your API, e.g. you might pick the win condition, or how the state changes when a move is made.*

- [ ] Write unit test definitions in `/web-app/tests`.
- [ ] Check the headings appear in the Testing sidebar.

### Unit Tests – Implementation
*Implement in code the unit tests specified above.*

- [ ] Implement the tests above.

### Web Application
*Produce a web application that allows a user to interface with your game module.*

- Implement in `/web-app`
  - [ ] `index.html`
  - [ ] `default.css`
  - [ ] `main.js`
  - [ ] Any other files you need to include.

### Finally
- [ ] Push to GitHub.
- [ ] Sync the changes.
- [ ] Check submission on GitHub website.