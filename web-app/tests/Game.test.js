import Quoridor from "../Game.js";
import fc from "fast-check";

describe("Quoridor", function () {

    describe("initial_state", function () {

        it("Player 1 starts at the top-middle [0, 4]", function () {
            const state = Quoridor.initial_state();
            const [row, col] = state.positions.player_1;
            if (row !== 0 || col !== 4) {
                throw new Error(
                    `Player 1 should start at [0, 4] but was [${row}, ${col}].`
                );
            }
        });

        it("Player 2 starts at the bottom-middle [8, 4]", function () {
            const state = Quoridor.initial_state();
            const [row, col] = state.positions.player_2;
            if (row !== 8 || col !== 4) {
                throw new Error(
                    `Player 2 should start at [8, 4] but was [${row}, ${col}].`
                );
            }
        });

        it("Both players start with 10 walls", function () {
            const state = Quoridor.initial_state();
            if (state.wall_counts.player_1 !== 10) {
                throw new Error("Player 1 should start with 10 walls.");
            }
            if (state.wall_counts.player_2 !== 10) {
                throw new Error("Player 2 should start with 10 walls.");
            }
        });

        it("No walls are placed at the start", function () {
            const state = Quoridor.initial_state();
            if (state.h_walls.length !== 0 || state.v_walls.length !== 0) {
                throw new Error("No walls should be placed at the start.");
            }
        });

        it("Player 1 goes first", function () {
            const state = Quoridor.initial_state();
            if (state.current_player !== "player_1") {
                throw new Error(
                    `Player 1 should go first but current_player` +
                    ` is "${state.current_player}".`
                );
            }
        });

        // Property: initial_state is a pure function — calling it multiple
        // times always returns the same result.
        it("initial_state is deterministic (property)", function () {
            fc.assert(fc.property(fc.nat(), function (_ignored) {
                const a = Quoridor.initial_state();
                const b = Quoridor.initial_state();
                return JSON.stringify(a) === JSON.stringify(b);
            }));
        });

        // Property: player positions are always within board bounds.
        it("Starting positions are always within board bounds (property)", function () {
            fc.assert(fc.property(fc.nat(), function (_ignored) {
                const state = Quoridor.initial_state();
                const size = Quoridor.BOARD_SIZE;
                const [r1, c1] = state.positions.player_1;
                const [r2, c2] = state.positions.player_2;
                return (
                    r1 >= 0 && r1 < size && c1 >= 0 && c1 < size &&
                    r2 >= 0 && r2 < size && c2 >= 0 && c2 < size
                );
            }));
        });

    });

    // TODO: Add property tests for is_ended, winner, legal_moves, and move
    // once those functions are implemented. Examples of properties to check:
    //   - move never mutates the input state
    //   - current_player alternates after each move
    //   - if is_ended is true, winner returns a player string
    //   - legal_moves never includes moves that go off the board

});
