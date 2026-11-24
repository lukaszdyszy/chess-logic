import { describe, it, expect, jest, beforeEach, test } from '@jest/globals'
import { BLACK_BISHOP, BLACK_KING, BLACK_KNIGHT, BLACK_PAWN, BLACK_QUEEN, BLACK_ROOK, Board, Chesslogic, EMPTY, STARTING_POSITION, TURN_WHITE, WHITE_BISHOP, WHITE_KING, WHITE_KNIGHT, WHITE_PAWN, WHITE_QUEEN, WHITE_ROOK } from '..';

jest.disableAutomock();

describe('Auxilary methods', () => {
	let chess: Chesslogic;

	beforeEach(() => {
		chess = new Chesslogic();
	});

	describe('getFieldCoordsByFieldName', () => {
		it('converts board field names to zero-indexed [row, col] coordinates', () => {
			expect(chess.getFieldCoordsByFieldName('a1')).toEqual([0, 0]);
			expect(chess.getFieldCoordsByFieldName('e4')).toEqual([3, 4]);
			expect(chess.getFieldCoordsByFieldName('h8')).toEqual([7, 7]);
		});
	});

	describe('getFieldNameByFieldCoords', () => {
		it('converts zero-indexed [row, col] coordinates back to field names', () => {
			expect(Chesslogic.getFieldNameByFieldCoords([0, 0])).toBe('a1');
			expect(Chesslogic.getFieldNameByFieldCoords([3, 4])).toBe('e4');
			expect(Chesslogic.getFieldNameByFieldCoords([7, 7])).toBe('h8');
		});
	});

	describe('getFieldValueByFieldName', () => {
		it('returns the correct piece or empty string for a given field name', () => {
			expect(chess.getFieldValueByFieldName('a1')).toBe('R');
			expect(chess.getFieldValueByFieldName('e1')).toBe('K');
			expect(chess.getFieldValueByFieldName('e4')).toBe('');
			expect(chess.getFieldValueByFieldName('e8')).toBe('k');
		});
	});

	describe('moveStringToArray', () => {
		it('parses a move string into [piece, fromField, toField]', () => {
			expect(chess.moveStringToArray('e2e4')).toEqual(['P', 'e2', 'e4', '']);
			expect(chess.moveStringToArray('b8c6')).toEqual(['n', 'b8', 'c6', '']);
		});
	});

	describe('isOnBoard', () => {
		it('returns true for coordinates within 8x8 bounds', () => {
			expect(Chesslogic.isOnBoard([0, 0])).toBe(true);
			expect(Chesslogic.isOnBoard([7, 7])).toBe(true);
			expect(Chesslogic.isOnBoard([3, 4])).toBe(true);
		});

		it('returns false for coordinates out of bounds', () => {
			expect(Chesslogic.isOnBoard([-1, 0])).toBe(false);
			expect(Chesslogic.isOnBoard([0, -1])).toBe(false);
			expect(Chesslogic.isOnBoard([8, 0])).toBe(false);
			expect(Chesslogic.isOnBoard([0, 8])).toBe(false);
		});
	});

	describe('sumVectors', () => {
		it('adds two coordinate vectors together', () => {
			expect(Chesslogic.sumVectors([1, 2], [3, 4])).toEqual([4, 6]);
			expect(Chesslogic.sumVectors([3, 3], [-1, -2])).toEqual([2, 1]);
		});
	});

	describe('isWhite', () => {
		it('returns true for uppercase characters and false for lowercase or empty string', () => {
			expect(Chesslogic.isWhite('P')).toBe(true);
			expect(Chesslogic.isWhite('K')).toBe(true);
			expect(Chesslogic.isWhite('p')).toBe(false);
			expect(Chesslogic.isWhite('')).toBe(false);
		});
	});

	describe('isBlack', () => {
		it('returns true for lowercase characters and false for uppercase or empty string', () => {
			expect(Chesslogic.isBlack('p')).toBe(true);
			expect(Chesslogic.isBlack('k')).toBe(true);
			expect(Chesslogic.isBlack('P')).toBe(false);
			expect(Chesslogic.isBlack('')).toBe(false);
		});
	});

	describe('isCheck', () => {
		it('returns false in the starting position', () => {
			expect(chess.isCheck()).toBe(false);
		});

		it('returns true when the current turn king is under attack', () => {
			const checkFen = 'rnbqkbnr/pppp1Qpp/8/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 3';
			const checkGame = new Chesslogic(checkFen);
			expect(checkGame.isCheck()).toBe(true);
		});

		it('should return true when the current player is in check by a rook/queen', () => {
			chess.loadFen('4k3/4r3/8/8/8/8/4K3/8 w - - 0 1');
			expect(chess.isCheck()).toBe(true);
		});

		it('should return false when a move successfully blocks or escapes check', () => {
			chess.loadFen('4k3/4r3/8/8/8/8/4K3/8 w - - 0 1');
			expect(chess.isCheck()).toBe(true);
			chess.move('e2d2');
			expect(chess.isCheck()).toBe(false);
		});

		it('should correctly identify check from a knight', () => {
			chess.loadFen('4k3/8/8/8/4K3/8/3n4/8 w - - 0 1');
			expect(chess.isCheck()).toBe(true);
		});

		it('should return false for a normal position where kings are safe', () => {
			chess.loadFen('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
			expect(chess.isCheck()).toBe(false);
		});
	});

	describe('isMate', () => {
		it('returns false in non-checkmate positions', () => {
			expect(chess.isMate()).toBe(false);
		});

		it('returns true in a checkmate position (Fool\'s Mate)', () => {
			const mateFen = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
			const mateGame = new Chesslogic(mateFen);
			expect(mateGame.isMate()).toBe(true);
		});
	});
});

describe('Load FEN', () => {
	describe('Invalid FENs - should throw an error', () => {
		const chessLogic = new Chesslogic();

		const invalidFens = [
			'',
			'rnbqkbnr/ppppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0',
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 f',
			'rndqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 -3',
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kQ - 0 1',
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR r KQkq - 0 1',
			'rnbqkbnr/pppppppp/8/7/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
		].map(f => {
			const testF = () => { chessLogic.loadFen(f); }

			it(f, () => {
				expect(testF).toThrow('Invalid FEN');
			});
		});
	});

	it(`Starting position: ${STARTING_POSITION}`, () => {
		const chessLogic = new Chesslogic();

		const expected: Board = [
			[WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT, WHITE_ROOK],
			[WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN],
			[BLACK_ROOK, BLACK_KNIGHT, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT, BLACK_ROOK]
		];

		chessLogic.loadFen(STARTING_POSITION);
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
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BLACK_ROOK, WHITE_KNIGHT]
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

	it('Loads a completely empty board', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen('8/8/8/8/8/8/8/8 b - - 0 1');

		const expected: Board = [
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
		];

		expect(chessLogic.board).toEqual(expected);
		expect(chessLogic.turn).toBe('b');
		expect(chessLogic.castle_K).toBeFalsy();
		expect(chessLogic.castle_Q).toBeFalsy();
		expect(chessLogic.castle_k).toBeFalsy();
		expect(chessLogic.castle_q).toBeFalsy();
		expect(chessLogic.enpassant).toBe('-');
		expect(chessLogic.halfmoves).toBe(0);
		expect(chessLogic.moves).toBe(1);
	});

	it('Loads a board containing only kings', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen('4k3/8/8/8/8/8/8/4K3 w - - 0 1');

		expect(chessLogic.board).toEqual([
			[EMPTY, EMPTY, EMPTY, EMPTY, WHITE_KING, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, BLACK_KING, EMPTY, EMPTY, EMPTY],
		]);

		expect(chessLogic.turn).toBe('w');
	});

	it('Loads black turn correctly', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'
		);

		expect(chessLogic.turn).toBe('b');
		expect(chessLogic.castle_K).toBeTruthy();
		expect(chessLogic.castle_Q).toBeTruthy();
		expect(chessLogic.castle_k).toBeTruthy();
		expect(chessLogic.castle_q).toBeTruthy();
	});

	it('Loads every possible castling-rights combination independently', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen('8/8/8/8/8/8/8/8 w K - 0 1');

		expect(chessLogic.castle_K).toBeTruthy();
		expect(chessLogic.castle_Q).toBeFalsy();
		expect(chessLogic.castle_k).toBeFalsy();
		expect(chessLogic.castle_q).toBeFalsy();

		chessLogic.loadFen('8/8/8/8/8/8/8/8 w Q - 0 1');

		expect(chessLogic.castle_K).toBeFalsy();
		expect(chessLogic.castle_Q).toBeTruthy();
		expect(chessLogic.castle_k).toBeFalsy();
		expect(chessLogic.castle_q).toBeFalsy();

		chessLogic.loadFen('8/8/8/8/8/8/8/8 w k - 0 1');

		expect(chessLogic.castle_K).toBeFalsy();
		expect(chessLogic.castle_Q).toBeFalsy();
		expect(chessLogic.castle_k).toBeTruthy();
		expect(chessLogic.castle_q).toBeFalsy();

		chessLogic.loadFen('8/8/8/8/8/8/8/8 w q - 0 1');

		expect(chessLogic.castle_K).toBeFalsy();
		expect(chessLogic.castle_Q).toBeFalsy();
		expect(chessLogic.castle_k).toBeFalsy();
		expect(chessLogic.castle_q).toBeTruthy();
	});

	it('Loads an en-passant target square', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'8/8/8/3pP3/8/8/8/8 b - e3 0 1'
		);

		expect(chessLogic.enpassant).toBe('e3');
		expect(chessLogic.turn).toBe('b');
	});

	it('Loads non-zero halfmove and fullmove counters', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'8/8/8/8/8/8/8/4K3 w - - 99 250'
		);

		expect(chessLogic.halfmoves).toBe(99);
		expect(chessLogic.moves).toBe(250);
	});

	it('Correctly handles different empty-square counts', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'7R/6R1/5R2/4R3/3R4/2R5/1R6/R7 w - - 0 1'
		);

		expect(chessLogic.board).toEqual([
			[WHITE_ROOK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, WHITE_ROOK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, WHITE_ROOK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, WHITE_ROOK, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, WHITE_ROOK, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WHITE_ROOK, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WHITE_ROOK, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WHITE_ROOK],
		]);
	});

	it('Correctly maps pieces to the top and bottom ranks', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'RNBQKBNR/8/8/8/8/8/8/rnbqkbnr w - - 0 1'
		);

		expect(chessLogic.board[7]).toEqual([
			WHITE_ROOK,
			WHITE_KNIGHT,
			WHITE_BISHOP,
			WHITE_QUEEN,
			WHITE_KING,
			WHITE_BISHOP,
			WHITE_KNIGHT,
			WHITE_ROOK,
		]);

		expect(chessLogic.board[0]).toEqual([
			BLACK_ROOK,
			BLACK_KNIGHT,
			BLACK_BISHOP,
			BLACK_QUEEN,
			BLACK_KING,
			BLACK_BISHOP,
			BLACK_KNIGHT,
			BLACK_ROOK,
		]);
	});

	it('Resets castling rights when loading a FEN without castling rights', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'
		);

		expect(chessLogic.castle_K).toBeTruthy();
		expect(chessLogic.castle_Q).toBeTruthy();
		expect(chessLogic.castle_k).toBeTruthy();
		expect(chessLogic.castle_q).toBeTruthy();

		chessLogic.loadFen(
			'r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1'
		);

		expect(chessLogic.castle_K).toBeFalsy();
		expect(chessLogic.castle_Q).toBeFalsy();
		expect(chessLogic.castle_k).toBeFalsy();
		expect(chessLogic.castle_q).toBeFalsy();
	});

	it('Replaces the entire previous board instead of leaving old pieces behind', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
		);

		chessLogic.loadFen(
			'8/8/8/8/8/8/8/4K3 w - - 0 1'
		);

		expect(chessLogic.board).toEqual([
			[EMPTY, EMPTY, EMPTY, EMPTY, WHITE_KING, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
		]);

		expect(chessLogic.castle_K).toBeFalsy();
		expect(chessLogic.castle_Q).toBeFalsy();
		expect(chessLogic.castle_k).toBeFalsy();
		expect(chessLogic.castle_q).toBeFalsy();
		expect(chessLogic.enpassant).toBe('-');
		expect(chessLogic.halfmoves).toBe(0);
		expect(chessLogic.moves).toBe(1);
	});

	it('Loads a FEN with maximum halfmove clock and a large fullmove number', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'8/8/8/8/8/8/8/4K3 w - - 100 999999'
		);

		expect(chessLogic.halfmoves).toBe(100);
		expect(chessLogic.moves).toBe(999999);
	});

	it('Loads pieces on every file of a rank', () => {
		const chessLogic = new Chesslogic();

		chessLogic.loadFen(
			'8/8/8/8/8/8/8/RNBQKBNR w - - 0 1'
		);

		expect(chessLogic.board[0]).toEqual([
			WHITE_ROOK,
			WHITE_KNIGHT,
			WHITE_BISHOP,
			WHITE_QUEEN,
			WHITE_KING,
			WHITE_BISHOP,
			WHITE_KNIGHT,
			WHITE_ROOK,
		]);
	});
});

describe('computeCandidates', () => {
	let chess: Chesslogic;

	beforeEach(() => {
		chess = new Chesslogic();
	});

	it('populates legal candidate moves for starting position', () => {
		// White starts with 20 legal moves (16 pawn moves + 4 knight moves)
		expect(chess.candidates.white.length).toBe(20);
		expect(chess.candidates.black.length).toBe(20);

		// Verify specific standard opening candidates
		expect(chess.candidates.white).toContain('e2e4');
		expect(chess.candidates.white).toContain('g1f3');
		expect(chess.candidates.black).toContain('e7e5');
		expect(chess.candidates.black).toContain('b8c6');
	});

	it('filters out illegal candidates that would expose king to check', () => {
		const pinFen = '6k1/5p2/8/8/2B5/8/8/6K1 b - - 0 1';
		const pinGame = new Chesslogic(pinFen);

		// The pinned pawn on f7 cannot move forward to f6 or f5
		const pawnMoves = pinGame.candidates.black.filter(move => move.startsWith('f7-'));

		expect(pawnMoves).not.toContain('f7f6');
		expect(pawnMoves).not.toContain('f7f5');
		expect(pawnMoves.length).toBe(0);
	});

	it('includes king-side and queen-side castling when conditions are met', () => {
		// Position where White can castle both kingside (e1-g1) and queenside (e1-c1)
		const castleFen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
		const castleGame = new Chesslogic(castleFen);

		expect(castleGame.candidates.white).toContain('e1g1');
		expect(castleGame.candidates.white).toContain('e1c1');
	});

	it('excludes castling when passing through or out of check', () => {
		// Black rook on f8 attacks f1, preventing White from castling kingside
		const castleBlockedFen = '5r1k/8/8/8/8/8/8/R3K2R w KQ - 0 1';
		const castleGame = new Chesslogic(castleBlockedFen);

		expect(castleGame.candidates.white).not.toContain('e1-g1');
	});

	it('includes en passant capture candidate when applicable', () => {
		// White pawn on e5, Black just played d7-d5 (enpassant target is d6)
		const enPassantFen = 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2';
		const epGame = new Chesslogic(enPassantFen);

		expect(epGame.candidates.white).toContain('e5d6');
	});

	describe('Check Evasion', () => {
		it('allows blocking, capturing, or moving the king when in a single check', () => {
			// White King on e1 is in check from Black Rook on e8.
			// White has a Queen on d1 and Knight on g1.
			const fen = '4r3/8/8/8/8/8/8/3QK1N1 w - - 0 1';
			chess = new Chesslogic(fen);

			const whiteMoves = chess.candidates.white;

			// King evasions
			expect(whiteMoves).toContain('e1d2');
			expect(whiteMoves).toContain('e1f1');
			expect(whiteMoves).toContain('e1f2');

			// Blocking the check
			expect(whiteMoves).toContain('d1e2'); // Queen blocks
			expect(whiteMoves).toContain('g1e2'); // Knight blocks

			// Invalid moves (cannot ignore check)
			expect(whiteMoves).not.toContain('d1c2');
			expect(whiteMoves).not.toContain('g1h3');
		});

		it('forces a king move when in a double check', () => {
			// White King on e1 is in double check from Black Queen on e7 and Knight on c2.
			// White has a Queen on h1.
			const fen = '8/4q3/8/8/8/8/2n5/4K2Q w - - 0 1';
			chess = new Chesslogic(fen);

			const whiteMoves = chess.candidates.white;

			// Because of double check, blocking or capturing one attacker is insufficient.
			// The h1 Queen cannot move to help.
			const nonKingMoves = whiteMoves.filter(move => !move.startsWith('e1'));
			expect(nonKingMoves.length).toBe(0);

			// Valid King evasions
			expect(whiteMoves).toContain('e1d1');
			expect(whiteMoves).toContain('e1f1');
		});
	});

	describe('Pins', () => {
		it('restricts a pinned piece from moving off the pin line', () => {
			const fen = '4r3/8/8/8/8/8/4R3/4K3 w - - 0 1';
			chess = new Chesslogic(fen);

			const rookMoves = chess.candidates.white.filter(move => move.startsWith('e2'));

			expect(rookMoves).toEqual(expect.arrayContaining([
				'e2e3', 'e2e4', 'e2e5', 'e2e6', 'e2e7', 'e2e8'
			]));

			expect(rookMoves).not.toContain('e2d2');
			expect(rookMoves).not.toContain('e2f2');
		});

		it('prevents pinned pieces from checking the opponent', () => {
			const fen = '4k3/4q3/8/8/4R3/8/8/4K3 w - - 0 1';
			chess = new Chesslogic(fen);

			const rookMoves = chess.candidates.white.filter(move => move.startsWith('e4'));

			expect(rookMoves).toEqual(expect.arrayContaining(['e4e5', 'e4e6', 'e4e7']));

			// Cannot move horizontally or jump to check the king
			expect(rookMoves).not.toContain('e4d4');
			expect(rookMoves).not.toContain('e4e8');
		});
	});

	describe('En Passant Edge Cases', () => {
		it('allows using en passant to evade a check', () => {
			const fen = '8/8/8/3pP3/4K3/8/8/8 w - d6 0 2';
			chess = new Chesslogic(fen);

			const whiteMoves = chess.candidates.white;

			expect(whiteMoves).toContain('e5d6');

			expect(whiteMoves).toContain('e4e3');
			expect(whiteMoves).toContain('e4f3');
		});

		it('prevents an en passant capture if it exposes the king to a horizontal check', () => {
			const fen = '8/8/8/KPp4r/8/8/8/8 w - c6 0 2';
			chess = new Chesslogic(fen);

			expect(chess.candidates.white).not.toContain('b5-c6');
		});
	});
});

describe('move', () => {
	let game: Chesslogic;

	beforeEach(() => {
		game = new Chesslogic();
	});

	test('should return true for a valid pawn opening move (e2 to e4)', () => {
		const result = game.move('e2e4');
		expect(result).toBe(true);
	});

	test('should return true for a valid knight opening move (g1 to f3)', () => {
		const result = game.move('g1f3');
		expect(result).toBe(true);
	});

	test('should return false for an illegal move according to chess rules (e.g., pawn moving 3 squares)', () => {
		const result = game.move('e2e5');
		expect(result).toBe(false);
	});

	test('should return false when trying to move a piece from an empty field', () => {
		const result = game.move('e3e4');
		expect(result).toBe(false);
	});

	test('should return false when trying to move opponent piece on the wrong turn', () => {
		const result = game.move('e7e5');
		expect(result).toBe(false);
	});

	test('should handle pawn promotion correctly with a promotion piece suffix', () => {
		game.loadFen('7k/4P3/8/8/8/8/4K3/8 w - - 0 1');

		const result = game.move('e7e8q');
		expect(result).toBe(true);
	});

	test('should return false for malformed or illegal move strings/coordinates', () => {
		const result = game.move('a1a9' as any);
		expect(result).toBe(false);
	});
});