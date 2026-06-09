/**
 * Quoridor provides the game logic for a two-player Quoridor board game.
 * Players take turns moving their pawn or placing a wall.
 * The goal is to reach the opposite side of the board before your opponent.
 * @namespace Quoridor
 * @author Mayli Jones
 * @version 2025/26
 */
const Quoridor = Object.create(null);

/** @memberof Quoridor */
Quoridor.BOARD_SIZE = 9;

/** @memberof Quoridor */
Quoridor.INITIAL_WALLS = 10;

/**
 * Returns the initial game state.
 * Player 1 starts at the top-middle [row 0, col 4] and aims to reach row 8.
 * Player 2 starts at the bottom-middle [row 8, col 4] and aims to reach row 0.
 * @memberof Quoridor
 * @function
 * @returns {Object} The starting game state.
 */
Quoridor.initial_state = function () {
    return Object.freeze({
        positions: Object.freeze({
            player_1: Object.freeze([0, 4]),
            player_2: Object.freeze([8, 4])
        }),
        // Horizontal walls block vertical movement.
        // A wall at [r, c] blocks movement between row r and row r+1
        // at columns c and c+1.
        h_walls: Object.freeze([]),
        // Vertical walls block horizontal movement.
        // A wall at [r, c] blocks movement between col c and col c+1
        // at rows r and r+1.
        v_walls: Object.freeze([]),
        wall_counts: Object.freeze({
            player_1: Quoridor.INITIAL_WALLS,
            player_2: Quoridor.INITIAL_WALLS
        }),
        current_player: "player_1"
    });
};

/**
 * Returns whether the game has ended.
 * Player 1 wins by reaching row 8. Player 2 wins by reaching row 0.
 * @memberof Quoridor
 * @function
 * @param {Object} state The current game state.
 * @returns {boolean} True if the game is over.
 */
Quoridor.is_ended = function (state) {
    return state.positions.player_1[0] === 8 || state.positions.player_2[0] === 0;
};

/**
 * Returns the winning player, or undefined if the game is not over.
 * @memberof Quoridor
 * @function
 * @param {Object} state The current game state.
 * @returns {string|undefined} "player_1", "player_2", or undefined.
 */
Quoridor.winner = function (state) {
    if (state.positions.player_1[0] === 8) {
        return "player_1";
    }
    if (state.positions.player_2[0] === 0) {
        return "player_2";
    }
    return;
};

/**
 * Returns an array of all legal moves for the current player.
 * Moves are either pawn moves or wall placements:
 *   Pawn move:      {type: "move", to: [row, col]}
 *   Wall placement: {type: "wall", orientation: "H" or "V", at: [row, col]}
 * @memberof Quoridor
 * @function
 * @param {Object} state The current game state.
 * @returns {Array} An array of legal move objects.
 */
Quoridor.legal_moves = function (state) {
    const opponent = state.current_player === "player_1" ? "player_2" : "player_1";
    const [row, col] = state.positions[state.current_player];
    const [opp_row, opp_col] = state.positions[opponent];
    const in_bounds = (r, c) => r >= 0 && r < Quoridor.BOARD_SIZE && c >= 0 && c < Quoridor.BOARD_SIZE;
    const has_h = (r, c) => state.h_walls.some((w) => w.at[0] === r && w.at[1] === c);
    const has_v = (r, c) => state.v_walls.some((w) => w.at[0] === r && w.at[1] === c);

    const is_blocked = (from_r, from_c, dr, dc) => {
        if (dr === -1) {
            return has_h(from_r - 1, from_c) || has_h(from_r - 1, from_c - 1);
        }
        if (dr === 1) {
            return has_h(from_r, from_c) || has_h(from_r, from_c - 1);
        }
        if (dc === -1) {
            return has_v(from_r, from_c - 1) || has_v(from_r - 1, from_c - 1);
        }
        if (dc === 1) {
            return has_v(from_r, from_c) || has_v(from_r - 1, from_c);
        }
        return false;
    };

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const moves = directions.reduce(function (acc, [dr, dc]) {
        const r = row + dr;
        const c = col + dc;
        if (!in_bounds(r, c) || is_blocked(row, col, dr, dc)) {
            return acc;
        }
        if (r !== opp_row || c !== opp_col) {
            acc.push({type: "move", to: [r, c]});
            return acc;
        }
        const jump_r = r + dr;
        const jump_c = c + dc;
        if (in_bounds(jump_r, jump_c) && !is_blocked(r, c, dr, dc)) {
            acc.push({type: "move", to: [jump_r, jump_c]});
        } else {
            const diagonals = dc === 0
                ? [[r, c - 1], [r, c + 1]]
                : [[r - 1, c], [r + 1, c]];
            diagonals.forEach(function (diag) {
                const diag_dr = diag[0] - r;
                const diag_dc = diag[1] - c;
                if (in_bounds(diag[0], diag[1]) && (diag[0] !== opp_row || diag[1] !== opp_col) &&
                        !is_blocked(r, c, diag_dr, diag_dc)) {
                    acc.push({type: "move", to: [diag[0], diag[1]]});
                }
            });
        }
        return acc;
    }, []);

    if (state.wall_counts[state.current_player] > 0) {
        for (let r = 0; r <= Quoridor.BOARD_SIZE - 2; r++) {
            for (let c = 0; c <= Quoridor.BOARD_SIZE - 2; c++) {
                if (!has_h(r, c) && !has_h(r, c + 1) && !has_h(r, c - 1) && !has_v(r, c)) {
                    moves.push({type: "wall", orientation: "H", at: [r, c]});
                }
                if (!has_v(r, c) && !has_v(r + 1, c) && !has_v(r - 1, c) && !has_h(r, c)) {
                    moves.push({type: "wall", orientation: "V", at: [r, c]});
                }
            }
        }
    }

    return moves;
};

/**
 * Applies a move to the given state and returns the new state.
 * The original state is never mutated.
 * @memberof Quoridor
 * @function
 * @param {Object} state The current game state.
 * @param {Object} move The move to apply.
 * @returns {Object} The new game state after the move.
 */
Quoridor.move = function (state, move) {
    const next_player = state.current_player === "player_1" ? "player_2" : "player_1";
    if (move.type === "move") {
        return Object.freeze({
            positions: Object.freeze({
                player_1: state.current_player === "player_1"
                    ? Object.freeze(move.to)
                    : state.positions.player_1,
                player_2: state.current_player === "player_2"
                    ? Object.freeze(move.to)
                    : state.positions.player_2
            }),
            h_walls: state.h_walls,
            v_walls: state.v_walls,
            wall_counts: state.wall_counts,
            current_player: next_player
        });
    }
    if (move.type === "wall") {
        const wall_entry = Object.freeze({at: Object.freeze(move.at), placed_by: state.current_player});
        const new_h_walls = move.orientation === "H"
            ? Object.freeze([...state.h_walls, wall_entry])
            : state.h_walls;
        const new_v_walls = move.orientation === "V"
            ? Object.freeze([...state.v_walls, wall_entry])
            : state.v_walls;
        return Object.freeze({
            positions: state.positions,
            h_walls: new_h_walls,
            v_walls: new_v_walls,
            wall_counts: Object.freeze({
                player_1: state.current_player === "player_1"
                    ? state.wall_counts.player_1 - 1
                    : state.wall_counts.player_1,
                player_2: state.current_player === "player_2"
                    ? state.wall_counts.player_2 - 1
                    : state.wall_counts.player_2
            }),
            current_player: next_player
        });
    }
    return state;
};

export default Object.freeze(Quoridor);
