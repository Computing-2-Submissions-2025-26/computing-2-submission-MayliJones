/*jslint node*/
import assert from "node:assert";
import fc from "fast-check";
import Quoridor from "../game.js";

// merges overrides over a bare-bones default state - only positions,
// wall_counts, h_walls and v_walls ever need overriding in these tests.
function make_state(overrides) {
    const base = {
        current_player: "player_1",
        h_walls: Object.freeze([]),
        positions: Object.freeze({
            player_1: Object.freeze([0, 4]),
            player_2: Object.freeze([8, 4])
        }),
        v_walls: Object.freeze([]),
        wall_counts: Object.freeze({
            player_1: Quoridor.INITIAL_WALLS,
            player_2: Quoridor.INITIAL_WALLS
        })
    };
    return Object.freeze(Object.assign(base, overrides));
}

function move_targets(state) {
    return Quoridor.legal_moves(state).filter(
        (m) => m.type === "move"
    ).map((m) => m.to);
}

function includes_cell(cells, cell) {
    return cells.some((c) => c[0] === cell[0] && c[1] === cell[1]);
}

describe("Quoridor", function () {

    describe("legal_moves - movement and jumping legality", function () {

        it(
            "should include the orthogonal move up/down/left/right when " +
            "the adjacent cell is empty, in bounds, and not wall-blocked",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([4, 4]),
                        player_2: Object.freeze([0, 0])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [3, 4]), true);
                assert.strictEqual(includes_cell(targets, [5, 4]), true);
                assert.strictEqual(includes_cell(targets, [4, 3]), true);
                assert.strictEqual(includes_cell(targets, [4, 5]), true);
            }
        );

        it(
            "should exclude a direction whose adjacent cell has a wall " +
            "between the pawn and that cell",
            function () {
                const state = make_state({
                    h_walls: Object.freeze([
                        Object.freeze({at: [4, 4], placed_by: "player_2"})
                    ]),
                    positions: Object.freeze({
                        player_1: Object.freeze([4, 4]),
                        player_2: Object.freeze([0, 0])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [5, 4]), false);
                assert.strictEqual(includes_cell(targets, [3, 4]), true);
                assert.strictEqual(includes_cell(targets, [4, 3]), true);
                assert.strictEqual(includes_cell(targets, [4, 5]), true);
            }
        );

        it(
            "should exclude moving off the top edge when the pawn is on " +
            "row 0",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([0, 4]),
                        player_2: Object.freeze([8, 0])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [-1, 4]), false);
            }
        );

        it(
            "should exclude moving off the bottom edge when the pawn is " +
            "on the last row",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([8, 4]),
                        player_2: Object.freeze([0, 0])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [9, 4]), false);
            }
        );

        it(
            "should exclude moving off the left edge when the pawn is on " +
            "column 0",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([4, 0]),
                        player_2: Object.freeze([0, 8])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [4, -1]), false);
            }
        );

        it(
            "should exclude moving off the right edge when the pawn is " +
            "on the last column",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([4, 8]),
                        player_2: Object.freeze([0, 0])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [4, 9]), false);
            }
        );

        it(
            "should allow jumping straight over an adjacent opponent pawn " +
            "onto the cell immediately beyond it, when that cell is " +
            "empty, in bounds, and unobstructed",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([3, 4]),
                        player_2: Object.freeze([4, 4])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [5, 4]), true);
            }
        );

        it(
            "should allow a diagonal jump to either side of the opponent " +
            "when the straight-jump cell beyond them is blocked by a wall",
            function () {
                const state = make_state({
                    h_walls: Object.freeze([
                        Object.freeze({at: [4, 4], placed_by: "player_2"})
                    ]),
                    positions: Object.freeze({
                        player_1: Object.freeze([3, 4]),
                        player_2: Object.freeze([4, 4])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [5, 4]), false);
                assert.strictEqual(includes_cell(targets, [4, 3]), true);
                assert.strictEqual(includes_cell(targets, [4, 5]), true);
            }
        );

        it(
            "should allow a diagonal jump to either side of the opponent " +
            "when the straight-jump cell beyond them is off the board edge",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([7, 4]),
                        player_2: Object.freeze([8, 4])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [9, 4]), false);
                assert.strictEqual(includes_cell(targets, [8, 3]), true);
                assert.strictEqual(includes_cell(targets, [8, 5]), true);
            }
        );

        it(
            "should exclude a diagonal jump destination that is itself " +
            "blocked by a wall",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([7, 4]),
                        player_2: Object.freeze([8, 4])
                    }),
                    v_walls: Object.freeze([
                        Object.freeze({at: [8, 4], placed_by: "player_2"})
                    ])
                });
                const targets = move_targets(state);
                assert.strictEqual(includes_cell(targets, [8, 5]), false);
                assert.strictEqual(includes_cell(targets, [8, 3]), true);
            }
        );

        it(
            "should not offer any jump moves, only the normal single-step " +
            "moves, when the opponent pawn is not adjacent",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([3, 4]),
                        player_2: Object.freeze([0, 0])
                    })
                });
                const targets = move_targets(state);
                assert.strictEqual(targets.length, 4);
                assert.strictEqual(includes_cell(targets, [2, 4]), true);
                assert.strictEqual(includes_cell(targets, [4, 4]), true);
                assert.strictEqual(includes_cell(targets, [3, 3]), true);
                assert.strictEqual(includes_cell(targets, [3, 5]), true);
            }
        );

    });

    describe("wall placement legality", function () {

        it(
            "should include a wall placement at an open position that has " +
            "no existing wall and leaves both players a path to their " +
            "goal row",
            function () {
                const state = Quoridor.initial_state();
                const wall_moves = Quoridor.legal_moves(state).filter(
                    (m) => m.type === "wall"
                );
                const has_it = wall_moves.some(
                    (m) => (
                        m.orientation === "H" &&
                        m.at[0] === 4 && m.at[1] === 4
                    )
                );
                assert.strictEqual(has_it, true);
            }
        );

        it(
            "should exclude a wall placement that exactly overlaps an " +
            "existing wall of the same orientation at the same position",
            function () {
                const state = make_state({
                    h_walls: Object.freeze([
                        Object.freeze({at: [4, 4], placed_by: "player_1"})
                    ])
                });
                const reason = Quoridor.wall_placement_reason(
                    state,
                    {at: [4, 4], orientation: "H"}
                );
                assert.strictEqual(reason, "overlap");
            }
        );

        it(
            "should exclude a wall placement that crosses an existing " +
            "perpendicular wall at the same anchor position",
            function () {
                const state = make_state({
                    h_walls: Object.freeze([
                        Object.freeze({at: [4, 4], placed_by: "player_1"})
                    ])
                });
                const reason = Quoridor.wall_placement_reason(
                    state,
                    {at: [4, 4], orientation: "V"}
                );
                assert.strictEqual(reason, "overlap");
            }
        );

        it(
            "should exclude a wall placement that would leave the " +
            "opponent with no path to their goal row",
            function () {
                const state = make_state({
                    current_player: "player_1",
                    h_walls: Object.freeze([
                        Object.freeze({at: [7, 0], placed_by: "player_1"})
                    ]),
                    positions: Object.freeze({
                        player_1: Object.freeze([0, 4]),
                        player_2: Object.freeze([8, 0])
                    })
                });
                const wall_moves = Quoridor.legal_moves(state).filter(
                    (m) => m.type === "wall"
                );
                const has_sealing_move = wall_moves.some(
                    (m) => (
                        m.orientation === "V" &&
                        m.at[0] === 7 && m.at[1] === 1
                    )
                );
                assert.strictEqual(has_sealing_move, false);
            }
        );

        it(
            "should exclude a wall placement that would leave the " +
            "placing player themselves with no path to their goal row",
            function () {
                const state = make_state({
                    current_player: "player_2",
                    h_walls: Object.freeze([
                        Object.freeze({at: [7, 0], placed_by: "player_1"})
                    ]),
                    positions: Object.freeze({
                        player_1: Object.freeze([0, 4]),
                        player_2: Object.freeze([8, 0])
                    })
                });
                const reason = Quoridor.wall_placement_reason(
                    state,
                    {at: [7, 1], orientation: "V"}
                );
                assert.strictEqual(reason, "blocks_path");
            }
        );

        it(
            "should not offer any wall moves for the current player once " +
            "their wall_counts reaches 0, regardless of open positions",
            function () {
                const state = make_state({
                    wall_counts: Object.freeze({player_1: 0, player_2: 10})
                });
                const wall_moves = Quoridor.legal_moves(state).filter(
                    (m) => m.type === "wall"
                );
                assert.strictEqual(wall_moves.length, 0);
            }
        );

        it(
            "has_path should return true for a player when at least one " +
            "route of unblocked cells connects their position to their " +
            "goal row",
            function () {
                const state = Quoridor.initial_state();
                assert.strictEqual(Quoridor.has_path(state, "player_1"), true);
                assert.strictEqual(Quoridor.has_path(state, "player_2"), true);
            }
        );

        it(
            "has_path should return true even when the only available " +
            "route requires a long detour around placed walls",
            function () {
                const state = make_state({
                    h_walls: Object.freeze([
                        Object.freeze({at: [3, 0], placed_by: "player_1"}),
                        Object.freeze({at: [3, 2], placed_by: "player_1"}),
                        Object.freeze({at: [3, 4], placed_by: "player_1"}),
                        Object.freeze({at: [3, 6], placed_by: "player_1"})
                    ])
                });
                assert.strictEqual(Quoridor.has_path(state, "player_1"), true);
                assert.strictEqual(
                    Quoridor.shortest_path_length(state, "player_1") > 8,
                    true
                );
            }
        );

        it(
            "has_path should return false for a player when walls fully " +
            "enclose them from ever reaching their goal row",
            function () {
                const state = make_state({
                    h_walls: Object.freeze([
                        Object.freeze({at: [7, 0], placed_by: "player_1"})
                    ]),
                    positions: Object.freeze({
                        player_1: Object.freeze([0, 4]),
                        player_2: Object.freeze([8, 0])
                    }),
                    v_walls: Object.freeze([
                        Object.freeze({at: [7, 1], placed_by: "player_1"})
                    ])
                });
                assert.strictEqual(
                    Quoridor.has_path(state, "player_2"),
                    false
                );
            }
        );

        it(
            "wall_placement_reason should report \"overlap\" for a wall " +
            "that collides with an existing wall",
            function () {
                const state = make_state({
                    h_walls: Object.freeze([
                        Object.freeze({at: [4, 4], placed_by: "player_1"})
                    ])
                });
                const reason = Quoridor.wall_placement_reason(
                    state,
                    {at: [4, 4], orientation: "H"}
                );
                assert.strictEqual(reason, "overlap");
            }
        );

        it(
            "wall_placement_reason should report \"blocks_path\" for a " +
            "wall that would trap either player",
            function () {
                const state = make_state({
                    h_walls: Object.freeze([
                        Object.freeze({at: [7, 0], placed_by: "player_1"})
                    ]),
                    positions: Object.freeze({
                        player_1: Object.freeze([0, 4]),
                        player_2: Object.freeze([8, 0])
                    })
                });
                const reason = Quoridor.wall_placement_reason(
                    state,
                    {at: [7, 1], orientation: "V"}
                );
                assert.strictEqual(reason, "blocks_path");
            }
        );

        it(
            "wall_placement_reason should report \"legal\" for a valid, " +
            "non-blocking, non-overlapping wall placement",
            function () {
                const state = Quoridor.initial_state();
                const reason = Quoridor.wall_placement_reason(
                    state,
                    {at: [4, 4], orientation: "H"}
                );
                assert.strictEqual(reason, "legal");
            }
        );

        it(
            "should never include a wall move in legal_moves for which " +
            "has_path would be false for either player - i.e. legal_moves " +
            "and wall_placement_reason must never disagree",
            function () {
                const state = make_state({
                    current_player: "player_1",
                    h_walls: Object.freeze([
                        Object.freeze({at: [7, 0], placed_by: "player_1"})
                    ]),
                    positions: Object.freeze({
                        player_1: Object.freeze([0, 4]),
                        player_2: Object.freeze([8, 0])
                    })
                });
                const wall_moves = Quoridor.legal_moves(state).filter(
                    (m) => m.type === "wall"
                );
                const any_disagreement = wall_moves.some(function (m) {
                    const reason = Quoridor.wall_placement_reason(state, {
                        at: m.at,
                        orientation: m.orientation
                    });
                    return reason !== "legal";
                });
                assert.strictEqual(any_disagreement, false);
            }
        );

    });

    describe("state transitions - Quoridor.move", function () {

        it(
            "should update the moving player's position to the target " +
            "cell when applying a pawn move",
            function () {
                const state = Quoridor.initial_state();
                const next = Quoridor.move(state, {to: [1, 4], type: "move"});
                assert.deepStrictEqual(next.positions.player_1, [1, 4]);
            }
        );

        it(
            "should add the wall to h_walls when applying a horizontal " +
            "wall placement, or to v_walls when applying a vertical one",
            function () {
                const state = Quoridor.initial_state();
                const afterH = Quoridor.move(
                    state,
                    {at: [4, 4], orientation: "H", type: "wall"}
                );
                assert.strictEqual(afterH.h_walls.length, 1);
                assert.deepStrictEqual(afterH.h_walls[0].at, [4, 4]);
                assert.strictEqual(afterH.v_walls.length, 0);

                const afterV = Quoridor.move(
                    state,
                    {at: [4, 4], orientation: "V", type: "wall"}
                );
                assert.strictEqual(afterV.v_walls.length, 1);
                assert.deepStrictEqual(afterV.v_walls[0].at, [4, 4]);
                assert.strictEqual(afterV.h_walls.length, 0);
            }
        );

        it(
            "should decrement the placing player's wall count by 1 when " +
            "applying a wall placement",
            function () {
                const state = Quoridor.initial_state();
                const next = Quoridor.move(
                    state,
                    {at: [4, 4], orientation: "H", type: "wall"}
                );
                assert.strictEqual(next.wall_counts.player_1, 9);
                assert.strictEqual(next.wall_counts.player_2, 10);
            }
        );

        it(
            "should switch current_player to the other player after " +
            "applying any move, pawn or wall",
            function () {
                const state = Quoridor.initial_state();
                const afterPawnMove = Quoridor.move(
                    state,
                    {to: [1, 4], type: "move"}
                );
                assert.strictEqual(afterPawnMove.current_player, "player_2");

                const afterWallMove = Quoridor.move(
                    state,
                    {at: [4, 4], orientation: "H", type: "wall"}
                );
                assert.strictEqual(afterWallMove.current_player, "player_2");
            }
        );

        it(
            "should not mutate the original state object passed in - the " +
            "input state's positions/walls/wall_counts remain unchanged " +
            "after move() returns a new state",
            function () {
                const state = Quoridor.initial_state();
                Quoridor.move(state, {to: [1, 4], type: "move"});
                Quoridor.move(
                    state,
                    {at: [4, 4], orientation: "H", type: "wall"}
                );
                assert.deepStrictEqual(state, Quoridor.initial_state());
            }
        );

    });

    describe("win condition - is_ended and winner", function () {

        it(
            "is_ended should be false when neither player has reached " +
            "their goal row",
            function () {
                const state = Quoridor.initial_state();
                assert.strictEqual(Quoridor.is_ended(state), false);
            }
        );

        it(
            "is_ended should be true when player_1 has reached row 8",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([8, 4]),
                        player_2: Object.freeze([5, 4])
                    })
                });
                assert.strictEqual(Quoridor.is_ended(state), true);
            }
        );

        it(
            "is_ended should be true when player_2 has reached row 0",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([5, 4]),
                        player_2: Object.freeze([0, 4])
                    })
                });
                assert.strictEqual(Quoridor.is_ended(state), true);
            }
        );

        it(
            "winner should identify player_1 as the winner when they " +
            "have reached row 8",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([8, 4]),
                        player_2: Object.freeze([5, 4])
                    })
                });
                assert.strictEqual(Quoridor.winner(state), "player_1");
            }
        );

        it(
            "winner should identify player_2 as the winner when they " +
            "have reached row 0",
            function () {
                const state = make_state({
                    positions: Object.freeze({
                        player_1: Object.freeze([5, 4]),
                        player_2: Object.freeze([0, 4])
                    })
                });
                assert.strictEqual(Quoridor.winner(state), "player_2");
            }
        );

    });

});

// random cell anywhere on the board.
function cell_arb() {
    return fc.tuple(
        fc.integer({min: 0, max: Quoridor.BOARD_SIZE - 1}),
        fc.integer({min: 0, max: Quoridor.BOARD_SIZE - 1})
    ).map(function (pair) {
        return Object.freeze([pair[0], pair[1]]);
    });
}

// random wall anchor - valid anchors only run 0..BOARD_SIZE-2, since a wall
// always spans two cells (see game.js's h_walls/v_walls doc comments).
function wall_arb() {
    return fc.record({
        at: fc.tuple(
            fc.integer({min: 0, max: Quoridor.BOARD_SIZE - 2}),
            fc.integer({min: 0, max: Quoridor.BOARD_SIZE - 2})
        ).map(function (pair) {
            return Object.freeze([pair[0], pair[1]]);
        }),
        placed_by: fc.constantFrom("player_1", "player_2")
    }).map(function (w) {
        return Object.freeze(w);
    });
}

// a structurally-valid (frozen, right shape) but not necessarily
// game-reachable state: distinct pawn positions anywhere on the board, a
// handful of walls (not filtered for mutual overlap - is_move_blocked and
// evaluate_wall don't require the *existing* walls to be mutually
// consistent, only the *candidate* wall under evaluation), and random wall
// counts. Deliberately simple - just enough variety to stress the
// properties below, not a simulator of legitimate game play.
const state_arb = fc.record({
    current_player: fc.constantFrom("player_1", "player_2"),
    h_walls: fc.array(wall_arb(), {maxLength: 4}),
    v_walls: fc.array(wall_arb(), {maxLength: 4}),
    positions: fc.tuple(cell_arb(), cell_arb()).filter(function (pair) {
        const p1 = pair[0];
        const p2 = pair[1];
        return p1[0] !== p2[0] || p1[1] !== p2[1];
    }),
    wall_counts: fc.record({
        player_1: fc.integer({min: 0, max: Quoridor.INITIAL_WALLS}),
        player_2: fc.integer({min: 0, max: Quoridor.INITIAL_WALLS})
    })
}).map(function (raw) {
    return Object.freeze({
        current_player: raw.current_player,
        h_walls: Object.freeze(raw.h_walls),
        positions: Object.freeze({
            player_1: raw.positions[0],
            player_2: raw.positions[1]
        }),
        v_walls: Object.freeze(raw.v_walls),
        wall_counts: Object.freeze(raw.wall_counts)
    });
});

// legal_moves() evaluates every candidate wall position with two BFS path
// checks, so 100 fc runs (default) legitimately takes a few seconds - well
// past Mocha's 2000ms default. .mocharc.json raises the global timeout to
// cover this rather than lowering fast-check's run count.
describe("property-based tests (fast-check)", function () {

    it(
        "every pawn move/jump in legal_moves stays within board bounds",
        function () {
            fc.assert(fc.property(state_arb, function (state) {
                const pawn_moves = Quoridor.legal_moves(state).filter(
                    (m) => m.type === "move"
                );
                pawn_moves.forEach(function (m) {
                    const [row, col] = m.to;
                    assert.strictEqual(
                        row >= 0 && row < Quoridor.BOARD_SIZE,
                        true
                    );
                    assert.strictEqual(
                        col >= 0 && col < Quoridor.BOARD_SIZE,
                        true
                    );
                });
            }));
        }
    );

    it(
        "every wall placement in legal_moves leaves both players a path " +
        "once actually applied",
        function () {
            fc.assert(fc.property(state_arb, function (state) {
                const wall_moves = Quoridor.legal_moves(state).filter(
                    (m) => m.type === "wall"
                );
                wall_moves.forEach(function (m) {
                    const next = Quoridor.move(state, m);
                    assert.strictEqual(
                        Quoridor.has_path(next, "player_1"),
                        true
                    );
                    assert.strictEqual(
                        Quoridor.has_path(next, "player_2"),
                        true
                    );
                });
            }));
        }
    );

    // scope limitation, not a gap to fix: has_path is defined as
    // shortest_path_length(...) !== null (see game.js), so the two are
    // coupled by construction and can never disagree with each other -
    // this only verifies that internal consistency, not that either
    // function is correct against ground truth. That correctness is
    // covered separately by the example-based has_path/
    // shortest_path_length tests above, which assert against known
    // expected values instead of cross-checking coupled functions.
    it(
        "has_path and shortest_path_length always agree with each other",
        function () {
            fc.assert(fc.property(
                state_arb,
                fc.constantFrom("player_1", "player_2"),
                function (state, player) {
                    const reachable = Quoridor.has_path(state, player);
                    const dist = Quoridor.shortest_path_length(
                        state,
                        player
                    );
                    assert.strictEqual(reachable, dist !== null);
                }
            ));
        }
    );

    it(
        "move never mutates the input state, for any legal move from any " +
        "generated state",
        function () {
            fc.assert(fc.property(
                state_arb,
                fc.nat(),
                function (state, seed) {
                    const moves = Quoridor.legal_moves(state);
                    fc.pre(moves.length > 0);
                    const move = moves[seed % moves.length];
                    const before = JSON.parse(JSON.stringify(state));
                    Quoridor.move(state, move);
                    assert.deepStrictEqual(
                        JSON.parse(JSON.stringify(state)),
                        before
                    );
                }
            ));
        }
    );

});
