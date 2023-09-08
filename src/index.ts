export const WHITE_PAWN = 'P';
export const WHITE_ROOK = 'R';
export const WHITE_KNIGHT = 'N';
export const WHITE_BISHOP = 'B';
export const WHITE_QUEEN = 'Q';
export const WHITE_KING = 'K';

export const BLACK_PAWN = 'p';
export const BLACK_ROOK = 'r';
export const BLACK_KNIGHT = 'n';
export const BLACK_BISHOP = 'b';
export const BLACK_QUEEN = 'q';
export const BLACK_KING = 'k';

export const EMPTY = '';

export enum WhitePiece {
	PAWN = WHITE_PAWN,
	ROOK = WHITE_ROOK,
	KNIGHT = WHITE_KNIGHT,
	BISHOP = WHITE_BISHOP,
	QUEEN = WHITE_QUEEN,
	KING = WHITE_KING,
}

export enum BlackPiece {
	PAWN = BLACK_PAWN,
	ROOK = BLACK_ROOK,
	KNIGHT = BLACK_KNIGHT,
	BISHOP = BLACK_BISHOP,
	QUEEN = BLACK_QUEEN,
	KING = BLACK_KING,
}

export type Piece = `${WhitePiece | BlackPiece}`;

export type RowName = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type ColName = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type FieldName = `${ColName}${RowName}`;
export type FieldCoords = [number, number];
export type FieldValue = Piece | '';

export type MoveString = `${FieldName}-${FieldName}`;
export type MoveName = `${WhitePiece}${FieldName}-${FieldName}`;
export type Move = [FieldCoords, FieldCoords];

type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type Board = Tuple<Tuple<FieldValue, 8>, 8>;

export const STARING_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const TURN_WHITE = 'w';
export const TURN_BLACK = 'b';

export type Turn = 'w' | 'b';

export const isValidFen = (fen: string): boolean => {
	// TODO

	return true;
}

export class Chesslogic {
	board!: Board;
	turn!: Turn;
	castle_k: boolean = false;
	castle_q: boolean = false;
	castle_K: boolean = false;
	castle_Q: boolean = false;
	enpassant: FieldName | '-' = '-';
	halfmoves: number = 0;
	moves: number = 0;

	constructor(FEN: string | null = null) {
		this.loadFen(FEN ?? STARING_POSITION);
	}

	loadFen(FEN: string) {
		if (!isValidFen(FEN)) throw new Error('Invalid FEN');

		const newBoard: Board = Chesslogic.getEmptyBoard();

		const [pieces, turn, castles, enpassant, halfmoves, moves] = FEN.split(' ');

		// load pieces to the board
		pieces.split('/').forEach((row, rowId) => {
			let col: number = 0;
			row.split('').forEach(el => {
				if (parseInt(el)) {
					// if empty field
					for (let i = 0; i < parseInt(el); i++) col++;
				} else {
					// if piece
					newBoard[7 - rowId][col] = el as FieldValue;
					col++;
				}

			});
		});
		this.board = newBoard;

		// current turn
		this.turn = turn as Turn;

		// castles possibilities
		this.castle_K = false;
		this.castle_Q = false;
		this.castle_k = false;
		this.castle_q = false;
		castles.split('').forEach(el => {
			switch (el) {
				case 'K':
					this.castle_K = true;
					break;
				case 'Q':
					this.castle_Q = true;
					break;
				case 'k':
					this.castle_k = true;
					break;
				case 'q':
					this.castle_q = true;
					break;
				default:
					break;
			}
		});

		// the rest
		this.enpassant = enpassant as (FieldName | '-');
		this.halfmoves = parseInt(halfmoves);
		this.moves = parseInt(moves);
	}

	static getEmptyBoard(): Board {
		return [[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]];
	}
}