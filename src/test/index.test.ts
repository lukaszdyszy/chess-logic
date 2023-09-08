jest.disableAutomock();

import { BLACK_BISHOP, BLACK_KING, BLACK_KNIGHT, BLACK_PAWN, BLACK_QUEEN, BLACK_ROOK, Board, Chesslogic, EMPTY, STARING_POSITION, TURN_WHITE, WHITE_BISHOP, WHITE_KING, WHITE_KNIGHT, WHITE_PAWN, WHITE_QUEEN, WHITE_ROOK } from '..';

describe('Load FEN', () => {
	it(`Starting position: ${STARING_POSITION}`, () => {
		const chessLogic = new Chesslogic();

		const expected: Board = [[WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT, WHITE_ROOK], [WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN], [BLACK_ROOK, BLACK_KNIGHT, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT, BLACK_ROOK]];
		chessLogic.loadFen(STARING_POSITION);
		const received: Board = chessLogic.board;

		expect(received).toEqual(expected);

		expect(chessLogic.castle_K).toBeTruthy();
		expect(chessLogic.castle_Q).toBeTruthy();
		expect(chessLogic.castle_k).toBeTruthy();
		expect(chessLogic.castle_q).toBeTruthy();
		expect(chessLogic.turn).toBe(TURN_WHITE);
		expect(chessLogic.enpassant).toBe('-');
		expect(chessLogic.halfmoves).toBe(0);
		expect(chessLogic.moves).toBe(1);
	});

	it('Random with 32 pieces: 6rN/rp1Pp2p/nqpPN1PK/pPp1P2Q/1BPb3R/P1R1p1P1/3pbk2/4nB2 w - - 0 1', () => {
		const chessLogic = new Chesslogic();

		const expected: Board = [
			[EMPTY, EMPTY, EMPTY, EMPTY, BLACK_KNIGHT, WHITE_BISHOP, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, BLACK_PAWN, BLACK_BISHOP, BLACK_KING, EMPTY, EMPTY],
			[WHITE_PAWN, EMPTY, WHITE_ROOK, EMPTY, BLACK_PAWN, EMPTY, WHITE_PAWN, EMPTY],
			[EMPTY, WHITE_BISHOP, WHITE_PAWN, BLACK_BISHOP, EMPTY, EMPTY, EMPTY, WHITE_ROOK],
			[BLACK_PAWN, WHITE_PAWN, BLACK_PAWN, EMPTY, WHITE_PAWN, EMPTY, EMPTY, WHITE_QUEEN],
			[BLACK_KNIGHT, BLACK_QUEEN, BLACK_PAWN, WHITE_PAWN, WHITE_KNIGHT, EMPTY, WHITE_PAWN, WHITE_KING],
			[BLACK_ROOK, BLACK_PAWN, EMPTY, WHITE_PAWN, BLACK_PAWN, EMPTY, EMPTY, BLACK_PAWN],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BLACK_ROOK, WHITE_KNIGHT],
		];

		chessLogic.loadFen('6rN/rp1Pp2p/nqpPN1PK/pPp1P2Q/1BPb3R/P1R1p1P1/3pbk2/4nB2 w - - 0 1');
		const received: Board = chessLogic.board;

		expect(received).toEqual(expected);

		expect(chessLogic.castle_K).toBeFalsy();
		expect(chessLogic.castle_Q).toBeFalsy();
		expect(chessLogic.castle_k).toBeFalsy();
		expect(chessLogic.castle_q).toBeFalsy();
		expect(chessLogic.turn).toBe(TURN_WHITE);
		expect(chessLogic.enpassant).toBe('-');
		expect(chessLogic.halfmoves).toBe(0);
		expect(chessLogic.moves).toBe(1);
	});

	it('Random with 13 pieces: 4K3/2p4P/1B3p2/3r4/3b1p2/3k4/PR6/3qn3 w - - 0 1', () => {
		const chessLogic = new Chesslogic();

		const expected: Board = [
			[EMPTY, EMPTY, EMPTY, BLACK_QUEEN, BLACK_KNIGHT, EMPTY, EMPTY, EMPTY],
			[WHITE_PAWN, WHITE_ROOK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, BLACK_KING, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, BLACK_BISHOP, EMPTY, BLACK_PAWN, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, BLACK_ROOK, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, WHITE_BISHOP, EMPTY, EMPTY, EMPTY, BLACK_PAWN, EMPTY, EMPTY],
			[EMPTY, EMPTY, BLACK_PAWN, EMPTY, EMPTY, EMPTY, EMPTY, WHITE_PAWN],
			[EMPTY, EMPTY, EMPTY, EMPTY, WHITE_KING, EMPTY, EMPTY, EMPTY],
		];

		chessLogic.loadFen('4K3/2p4P/1B3p2/3r4/3b1p2/3k4/PR6/3qn3 w - - 0 1');
		const received: Board = chessLogic.board;

		expect(received).toEqual(expected);

		expect(chessLogic.castle_K).toBeFalsy();
		expect(chessLogic.castle_Q).toBeFalsy();
		expect(chessLogic.castle_k).toBeFalsy();
		expect(chessLogic.castle_q).toBeFalsy();
		expect(chessLogic.turn).toBe(TURN_WHITE);
		expect(chessLogic.enpassant).toBe('-');
		expect(chessLogic.halfmoves).toBe(0);
		expect(chessLogic.moves).toBe(1);
	});
});