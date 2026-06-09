import Quoridor from "./Game.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const status_el = document.getElementById("status");
const panel_el = document.getElementById("side-panel");

let CELL_SIZE;
let GAP_SIZE;
function recalculate_sizes() {
    const available = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.78);
    CELL_SIZE = available / (Quoridor.BOARD_SIZE + (Quoridor.BOARD_SIZE - 1) * 0.15);
    GAP_SIZE = CELL_SIZE * 0.15;
    canvas.width = available;
    canvas.height = available;
}

recalculate_sizes();

const PLAYER_NAMES = {
    player_1: "Blue Hexagon",
    player_2: "Orange Triangle"
};

let state = Quoridor.initial_state();
let pawn_selected = false;
let selected_wall = false;
let wall_orientation = "H";
let wall_preview = null;

/**
 * Converts a board row or column index to a canvas pixel position.
 * @param {number} index The row or column index (0–8).
 * @returns {number} The top-left pixel position of that cell.
 */
function to_pixel(index) {
    return index * (CELL_SIZE + GAP_SIZE);
}

/**
 * Renders the current game state to the canvas.
 */
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const legal_destinations = pawn_selected
        ? Quoridor.legal_moves(state).filter((m) => m.type === "move").map((m) => m.to)
        : [];

    for (let row = 0; row < Quoridor.BOARD_SIZE; row++) {
        for (let col = 0; col < Quoridor.BOARD_SIZE; col++) {
            const is_goal_row = row === 0 || row === Quoridor.BOARD_SIZE - 1;
            const is_legal = legal_destinations.some((to) => to[0] === row && to[1] === col);
            if (is_legal) {
                ctx.fillStyle = is_goal_row ? "#ede0c0" : "#f8f2e2";
            } else {
                ctx.fillStyle = is_goal_row ? "#d9c9a8" : "#f0e6cc";
            }
            ctx.fillRect(to_pixel(col), to_pixel(row), CELL_SIZE, CELL_SIZE);
        }
    }
    state.h_walls.forEach(function (wall) {
        const [r, c] = wall.at;
        ctx.fillStyle = wall.placed_by === "player_1" ? "#4a90d9" : "#f5a623";
        ctx.fillRect(to_pixel(c), to_pixel(r) + CELL_SIZE, CELL_SIZE * 2 + GAP_SIZE, GAP_SIZE);
    });
    state.v_walls.forEach(function (wall) {
        const [r, c] = wall.at;
        ctx.fillStyle = wall.placed_by === "player_1" ? "#4a90d9" : "#f5a623";
        ctx.fillRect(to_pixel(c) + CELL_SIZE, to_pixel(r), GAP_SIZE, CELL_SIZE * 2 + GAP_SIZE);
    });
    if (wall_preview) {
        const [r, c] = wall_preview.at;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = state.current_player === "player_1" ? "#4a90d9" : "#f5a623";
        if (wall_preview.orientation === "H") {
            ctx.fillRect(to_pixel(c), to_pixel(r) + CELL_SIZE, CELL_SIZE * 2 + GAP_SIZE, GAP_SIZE);
        } else {
            ctx.fillRect(to_pixel(c) + CELL_SIZE, to_pixel(r), GAP_SIZE, CELL_SIZE * 2 + GAP_SIZE);
        }
        ctx.globalAlpha = 1;
    }
    const radius = CELL_SIZE * 0.38;

    const p1 = state.positions.player_1;
    const p1x = to_pixel(p1[1]) + CELL_SIZE / 2;
    const p1y = to_pixel(p1[0]) + CELL_SIZE / 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        const px = p1x + radius * Math.cos(angle);
        const py = p1y + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fillStyle = "#4a90d9";
    ctx.fill();
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.stroke();

    const p2 = state.positions.player_2;
    const p2x = to_pixel(p2[1]) + CELL_SIZE / 2;
    const p2y = to_pixel(p2[0]) + CELL_SIZE / 2;
    ctx.beginPath();
    ctx.moveTo(p2x, p2y - radius);
    ctx.lineTo(p2x + radius * Math.sin((Math.PI * 2) / 3), p2y - radius * Math.cos((Math.PI * 2) / 3));
    ctx.lineTo(p2x + radius * Math.sin((Math.PI * 4) / 3), p2y - radius * Math.cos((Math.PI * 4) / 3));
    ctx.closePath();
    ctx.fillStyle = "#f5a623";
    ctx.fill();
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (Quoridor.is_ended(state)) {
        status_el.textContent = `Game over! Winner: ${PLAYER_NAMES[Quoridor.winner(state)]}`;
    } else {
        status_el.textContent = `Current player: ${PLAYER_NAMES[state.current_player]}`;
    }
}

/**
 * Applies a player action and re-renders.
 * @param {Object} action A legal move object from Quoridor.legal_moves.
 */
function handle_action(action) {
    if (Quoridor.is_ended(state)) {
        return;
    }
    state = Quoridor.move(state, action);
    pawn_selected = false;
    selected_wall = false;
    wall_preview = null;
    render();
    render_panel();
}

// Handle clicks on the canvas.
canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / (CELL_SIZE + GAP_SIZE));
    const row = Math.floor(y / (CELL_SIZE + GAP_SIZE));
    if (selected_wall) {
        const already_previewed = wall_preview &&
            wall_preview.at[0] === row && wall_preview.at[1] === col &&
            wall_preview.orientation === wall_orientation;
        if (already_previewed) {
            const moves = Quoridor.legal_moves(state);
            const match = moves.find(
                (m) => m.type === "wall" && m.orientation === wall_orientation &&
                       m.at[0] === row && m.at[1] === col
            );
            if (match) {
                handle_action(match);
            }
        } else {
            wall_preview = {orientation: wall_orientation, at: [row, col]};
            render();
        }
        return;
    }
    const pawn = state.positions[state.current_player];
    if (row === pawn[0] && col === pawn[1]) {
        pawn_selected = !pawn_selected;
        render();
        render_panel();
        return;
    }
    if (pawn_selected) {
        const moves = Quoridor.legal_moves(state);
        const match = moves.find((m) => m.type === "move" && m.to[0] === row && m.to[1] === col);
        if (match) {
            handle_action(match);
            return;
        }
    }
    pawn_selected = false;
    selected_wall = false;
    wall_preview = null;
    render();
    render_panel();
});

/**
 * Updates the side panel with each player's wall count and turn indicator.
 */
function render_panel() {
    const players = [
        {key: "player_1", shape: "⬡", label: "Blue Hexagon", color: "#4a90d9"},
        {key: "player_2", shape: "▲", label: "Orange Triangle", color: "#f5a623"}
    ];
    panel_el.innerHTML = players.map(function ({key, shape, label, color}) {
        const is_active = state.current_player === key;
        const walls = state.wall_counts[key];
        const wall_btn = is_active && walls > 0
            ? `<br><button id="wall-btn" style="
                margin-top: 6px;
                padding: 4px 8px;
                border-radius: 4px;
                border: 2px solid #5c3d1e;
                background: ${selected_wall ? "#5c3d1e" : "#e8d9b8"};
                color: ${selected_wall ? "#fff" : "#5c3d1e"};
                cursor: pointer;
                font-size: 0.85em;
                font-weight: bold;
              ">${selected_wall ? `Place ${wall_orientation} wall` : "Place wall"}</button>`
            : "";
        return `<div style="
            margin-bottom: 20px;
            padding: 8px;
            border-radius: 6px;
            background: ${is_active ? "rgba(0,0,0,0.08)" : "transparent"};
            font-weight: ${is_active ? "bold" : "normal"};
        ">
            <span style="color: ${color}; font-size: 1.2em;">${shape}</span>
            ${label}${is_active ? " ◀" : ""}<br>
            <small>Walls: ${walls}</small>
            ${wall_btn}
        </div>`;
    }).join("");

    const wall_btn_el = panel_el.querySelector("#wall-btn");
    if (wall_btn_el) {
        wall_btn_el.addEventListener("click", function () {
            if (selected_wall) {
                wall_orientation = wall_orientation === "H" ? "V" : "H";
                wall_preview = null;
            } else {
                selected_wall = true;
                pawn_selected = false;
            }
            render();
            render_panel();
        });
    }
}

canvas.addEventListener("mousemove", function (event) {
    if (!selected_wall) {
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / (CELL_SIZE + GAP_SIZE));
    const row = Math.floor(y / (CELL_SIZE + GAP_SIZE));
    const legal = Quoridor.legal_moves(state);
    const valid = legal.some(
        (m) => m.type === "wall" && m.orientation === wall_orientation &&
               m.at[0] === row && m.at[1] === col
    );
    wall_preview = valid ? {orientation: wall_orientation, at: [row, col]} : null;
    render();
});

window.addEventListener("resize", function () {
    recalculate_sizes();
    render();
    render_panel();
});

render();
render_panel();
