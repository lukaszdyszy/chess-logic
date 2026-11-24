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

export const Pieces = [
	WHITE_PAWN,
	WHITE_ROOK,
	WHITE_KNIGHT,
	WHITE_BISHOP,
	WHITE_QUEEN,
	WHITE_KING,
	BLACK_PAWN,
	BLACK_ROOK,
	BLACK_KNIGHT,
	BLACK_BISHOP,
	BLACK_QUEEN,
	BLACK_KING
];

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

export type MoveString = `${FieldName}${FieldName}${PromotionPiece | ''}`;
export type Move = [FieldCoords, FieldCoords];

export type Vector = [number, number];

type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type Board = Tuple<Tuple<FieldValue, 8>, 8>;

export const STARTING_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const TURN_WHITE = 'w';
export const TURN_BLACK = 'b';

export type Turn = 'w' | 'b';

export type Candidates = {
	white: MoveString[];
	black: MoveString[];
}

export type PromotionPiece = 'q' | 'r' | 'n' | 'b';

// helpers
const isUpperCase = (char: string): boolean => (char.charCodeAt(0) >= 65 && char.charCodeAt(0) <= 90);
const isLowerCase = (char: string): boolean => (char.charCodeAt(0) >= 97 && char.charCodeAt(0) <= 122);

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

	candidates: Candidates = {
		white: [],
		black: []
	}

	moveFailed: string = '';

	constructor(FEN: string | null = null) {
		this.loadFen(FEN ?? STARTING_POSITION);
	}

	movePiece(from: FieldName, to: FieldName) {
		const fromCoords = this.getFieldCoordsByFieldName(from);
		const toCoords = this.getFieldCoordsByFieldName(to);
		const piece = this.board[fromCoords[0]][fromCoords[1]];

		this.board[fromCoords[0]][fromCoords[1]] = '';
		this.board[toCoords[0]][toCoords[1]] = piece;
	}

	promote(field: FieldName, piece: PromotionPiece) {
		const actPiece = (this.turn === TURN_WHITE ? piece.toUpperCase() : piece) as Piece;
		const [row, col] = this.getFieldCoordsByFieldName(field)
		this.board[row][col] = actPiece;
	}

	private makeMove(moveString: MoveString): boolean {
		const [piece, from, to] = this.moveStringToArray(moveString);

		this.movePiece(from, to);

		// castles
		if (piece === WHITE_KING) {
			if (moveString === 'e1g1') {
				this.movePiece('h1', 'f1');
			} else if (moveString === 'e1c1') {
				this.movePiece('a1', 'd1');
			}
		} else if (piece === BLACK_KING) {
			if (moveString === 'e8g8') {
				this.movePiece('h8', 'f8');
			} else if (moveString === 'e8c8') {
				this.movePiece('a8', 'd8');
			}
		}

		// enpassant
		if (to === this.enpassant) {
			let fromC = this.getFieldCoordsByFieldName(from);
			let toC = this.getFieldCoordsByFieldName(to);
			this.board[fromC[0]][toC[1]] = '';
		}

		return true;
	}

	move(moveString: MoveString): boolean {
		// is move possible
		const possibilities = this.turn === TURN_WHITE ? this.candidates.white : this.candidates.black;
		if (possibilities.indexOf(moveString.substring(0, 4) as MoveString) === -1) return false;

		const [piece, from, to, promoteTo] = this.moveStringToArray(moveString);

		// is promotion needed
		if ((piece === BLACK_PAWN && to[1] === '1') || (piece === WHITE_PAWN && to[1] === '8')) {
			if (promoteTo === EMPTY) {
				this.moveFailed = 'Promotion necessary.';
				return false;
			}
		}

		// move pieces on the board
		this.makeMove(moveString);

		// promote pawn
		if ((piece === BLACK_PAWN && to[1] === '1') || (piece === WHITE_PAWN && to[1] === '8')) {
			this.promote(to, promoteTo as PromotionPiece);
		}

		// Apply move's after-effects: 
		// castles possibility
		if (from === 'e1') {
			this.castle_K = false;
			this.castle_Q = false;
		} else if (from === 'a1') {
			this.castle_Q = false;
		} else if (from === 'h1') {
			this.castle_K = false;
		} else if (from === 'e8') {
			this.castle_k = false;
			this.castle_q = false;
		} else if (from === 'a8') {
			this.castle_q = false;
		} else if (from === 'h8') {
			this.castle_k = false;
		}

		// enpassants
		if (piece === BLACK_PAWN && from[1] === '7' && to[1] === '5') {
			this.enpassant = `${from[0]}6` as FieldName;
		} else if (piece === WHITE_PAWN && from[1] === '2' && to[1] === '4') {
			this.enpassant = `${from[0]}3` as FieldName;
		} else {
			this.enpassant = '-';
		}

		// count halfmoves
		if (piece === 'p' || piece === 'P' || this.getFieldValueByFieldName(to) !== '') {
			this.halfmoves = 0;
		} else {
			this.halfmoves++;
		}

		// count moves
		if (this.turn === TURN_WHITE) this.moves++;

		this.turn = this.turn === TURN_WHITE ? TURN_BLACK : TURN_WHITE;

		this.computeCandidates();

		this.moveFailed = '';

		return true;
	}

	private computeCandidates() {
		this.calculateCandidates();
		this.verifyCandidates();
	}

	private calculateCandidates() {
		const candidates: Candidates = {
			white: [],
			black: []
		}

		this.board.map((row, rowId) => {
			row.map((el, colId) => {
				if (el === '') return;

				let originalPosition = [rowId, colId] as FieldCoords;

				let dest = [0, 0] as FieldCoords;

				let W = isUpperCase(el);

				const addCand = () => {
					if (Chesslogic.isOnBoard(dest)) {
						candidates[W ? 'white' : 'black'].push(
							`${Chesslogic.getFieldNameByFieldCoords(originalPosition)}${Chesslogic.getFieldNameByFieldCoords(dest)}`
						);
					}
				}

				const checkMove = (vector: Vector) => {
					dest = Chesslogic.sumVectors(originalPosition, vector);

					if (!Chesslogic.isOnBoard(dest)) return false;

					// move impossible
					if (W && Chesslogic.isWhite(this.board[dest[0]][dest[1]]) || !W && Chesslogic.isBlack(this.board[dest[0]][dest[1]])) {
						return false;
					}

					// move possible, but not further than this field (taking)
					if (W && Chesslogic.isBlack(this.board[dest[0]][dest[1]]) || !W && Chesslogic.isWhite(this.board[dest[0]][dest[1]])) {
						addCand();
						return false;
					}

					// else - move possible and keep iterating

					addCand();

					return true;
				}

				switch (el) {
					case WHITE_PAWN:
						// [1, 0] - push pawn
						dest = Chesslogic.sumVectors(originalPosition, [1, 0]);

						if (Chesslogic.isOnBoard(dest) && this.board[dest[0]][dest[1]] === '') {
							addCand();

							// [2, 0] - first move
							if (rowId === 1) {
								dest = Chesslogic.sumVectors(originalPosition, [2, 0]);
								if (this.board[dest[0]][dest[1]] === EMPTY) addCand();
							}
						}

						// [1, 1] - take
						dest = Chesslogic.sumVectors(originalPosition, [1, 1]);
						if (
							Chesslogic.isOnBoard(dest) &&
							((Chesslogic.isBlack(this.board[dest[0]][dest[1]]) || (Chesslogic.getFieldNameByFieldCoords(dest)) === this.enpassant))
						) {
							addCand();
						}

						// [1, -1] - take
						dest = Chesslogic.sumVectors(originalPosition, [1, -1]);
						if (
							Chesslogic.isOnBoard(dest) &&
							((Chesslogic.isBlack(this.board[dest[0]][dest[1]]) || (Chesslogic.getFieldNameByFieldCoords(dest)) === this.enpassant))
						) {
							addCand();
						}

						break;

					case BLACK_PAWN:
						// [-1, 0] - push pawn
						dest = Chesslogic.sumVectors(originalPosition, [-1, 0]);

						if (Chesslogic.isOnBoard(dest) && this.board[dest[0]][dest[1]] === EMPTY) {
							addCand();

							// [-2, 0] - first move
							if (rowId === 6) {
								dest = Chesslogic.sumVectors(originalPosition, [-2, 0]);
								if (this.board[dest[0]][dest[1]] === EMPTY) addCand();
							}
						}

						// [-1, 1] - take
						dest = Chesslogic.sumVectors(originalPosition, [-1, 1]);
						if (
							Chesslogic.isOnBoard(dest) &&
							((Chesslogic.isWhite(this.board[dest[0]][dest[1]]) || (Chesslogic.getFieldNameByFieldCoords(dest)) === this.enpassant))
						) {
							addCand();
						}

						// [-1, -1] - take
						dest = Chesslogic.sumVectors(originalPosition, [-1, -1]);
						if (
							Chesslogic.isOnBoard(dest) &&
							((Chesslogic.isWhite(this.board[dest[0]][dest[1]]) || (Chesslogic.getFieldNameByFieldCoords(dest)) === this.enpassant))
						) {
							addCand();
						}

						break;

					case WHITE_ROOK:
					case BLACK_ROOK:
						for (let i = 1; i < 8; i++) {
							if (!checkMove([i, 0])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([-i, 0])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([0, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([0, -i])) break;
						}

						break;

					case WHITE_BISHOP:
					case BLACK_BISHOP:
						for (let i = 1; i < 8; i++) {
							if (!checkMove([i, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([i, -i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([-i, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([-i, -i])) break;
						}

						break;

					case WHITE_KNIGHT:
					case BLACK_KNIGHT:
						checkMove([2, 1]);
						checkMove([2, -1]);
						checkMove([-2, 1]);
						checkMove([-2, -1]);
						checkMove([1, 2]);
						checkMove([1, -2]);
						checkMove([-1, 2]);
						checkMove([-1, -2]);
						break;

					case WHITE_QUEEN:
					case BLACK_QUEEN:
						for (let i = 1; i < 8; i++) {
							if (!checkMove([i, 0])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([-i, 0])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([0, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([0, -i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([i, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([i, -i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([-i, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if (!checkMove([-i, -i])) break;
						}

						break;

					case WHITE_KING:
					case BLACK_KING:
						checkMove([-1, -1]);
						checkMove([-1, 0]);
						checkMove([-1, 1]);
						checkMove([0, -1]);
						checkMove([0, 1]);
						checkMove([1, -1]);
						checkMove([1, 0]);
						checkMove([1, 1]);

						break;
					default:
						break;
				}
			});
		});

		// castles
		if (this.castle_k &&
			this.getFieldValueByFieldName('f8') === '' &&
			this.getFieldValueByFieldName('g8') === ''
		) {
			const dealbreaks = candidates['white'].map(cand => {
				if (cand.split('-')[1] === 'f8' ||
					cand.split('-')[1] === 'g8' ||
					cand.split('-')[1] === 'e8'
				) {
					return cand;
				}
			}).filter(Boolean);

			if (dealbreaks.length === 0) {
				candidates.black.push('e8g8');
			}
		}

		if (this.castle_q &&
			this.getFieldValueByFieldName('b8') === '' &&
			this.getFieldValueByFieldName('c8') === '' &&
			this.getFieldValueByFieldName('d8') === ''
		) {
			const dealbreaks = candidates.white.map(cand => {
				if (cand.split('-')[1] === 'b8' ||
					cand.split('-')[1] === 'c8' ||
					cand.split('-')[1] === 'd8' ||
					cand.split('-')[1] === 'e8'
				) {
					return cand;
				}
			}).filter(Boolean);

			if (dealbreaks.length === 0) {
				candidates.black.push('e8c8');
			}
		}

		if (this.castle_K &&
			this.getFieldValueByFieldName('f1') === '' &&
			this.getFieldValueByFieldName('g1') === ''
		) {
			const dealbreaks = candidates.black.map(cand => {
				if (cand.split('-')[1] === 'f1' ||
					cand.split('-')[1] === 'g1' ||
					cand.split('-')[1] === 'e1'
				) {
					return cand;
				}
			}).filter(Boolean);

			if (dealbreaks.length === 0) {
				candidates.white.push('e1g1');
			}
		}

		if (this.castle_Q &&
			this.getFieldValueByFieldName('b1') === '' &&
			this.getFieldValueByFieldName('c1') === '' &&
			this.getFieldValueByFieldName('d1') === ''
		) {
			const dealbreaks = candidates.black.map(cand => {
				if (cand.split('-')[1] === 'b1' ||
					cand.split('-')[1] === 'c1' ||
					cand.split('-')[1] === 'd1' ||
					cand.split('-')[1] === 'e1'
				) {
					return cand;
				}
			}).filter(Boolean);

			if (dealbreaks.length === 0) {
				candidates.white.push('e1c1');
			}
		}

		this.candidates = candidates;
	}

	// exclude moves that lead to check
	private verifyCandidates() {
		let cands = [...this.candidates[this.turn === TURN_WHITE ? 'white' : 'black']];
		let originalBoard = this.board.map(arr => arr.slice()) as Board;
		let originalCandidates = JSON.stringify(this.candidates);

		cands.map(mv => {
			this.makeMove(mv);

			this.calculateCandidates();
			if (this.isCheck()) {
				this.candidates = JSON.parse(originalCandidates);
				this.candidates[this.turn === TURN_WHITE ? 'white' : 'black'].splice(
					this.candidates[this.turn === TURN_WHITE ? 'white' : 'black'].indexOf(mv),
					1
				);
				originalCandidates = JSON.stringify(this.candidates);
			}

			this.board = originalBoard.map(arr => arr.slice()) as Board;
			this.candidates = JSON.parse(originalCandidates);
		});
	}

	isCheck(): boolean {
		const moves = [...this.candidates[this.turn !== TURN_WHITE ? 'white' : 'black']];
		let kingPos = '';
		this.board.forEach((row, rowid) => {
			row.forEach((col, colid) => {
				if (col === (this.turn === TURN_WHITE ? WHITE_KING : BLACK_KING)) kingPos = Chesslogic.getFieldNameByFieldCoords([rowid, colid]);
			});
		});

		const checking = moves.filter(move => move.substring(2, 4) === kingPos);

		if (checking.length === 0) return false;
		return true;
	}

	isMate(): boolean {
		return this.isCheck() && this.candidates[this.turn === TURN_WHITE ? 'white' : 'black'].length === 0;
	}

	isStaleMate(): boolean {
		return !this.isCheck() && this.candidates[this.turn === TURN_WHITE ? 'white' : 'black'].length === 0;
	}

	isMovePossible(moveString: MoveString): boolean {
		return this.candidates[this.turn === TURN_WHITE ? 'white' : 'black'].includes(moveString);
	}

	getFieldValueByFieldName(name: FieldName): FieldValue {
		const [row, col] = this.getFieldCoordsByFieldName(name);
		return this.board[row][col];
	}

	getFieldCoordsByFieldName(fieldName: FieldName): FieldCoords {
		return [+fieldName[1] - 1, fieldName.charCodeAt(0) - 97];
	}

	static getFieldNameByFieldCoords(fieldCoords: FieldCoords): FieldName {
		return `${String.fromCharCode(97 + fieldCoords[1])}${fieldCoords[0] + 1}` as FieldName;
	}

	moveStringToArray(moveString: MoveString): [FieldValue, FieldName, FieldName, PromotionPiece | ''] {
		let from = moveString.substring(0, 2);
		let to = moveString.substring(2, 4);
		let promoteTo = (moveString.length === 5 ? moveString.substring(4) : '') as PromotionPiece | '';

		const piece = this.getFieldValueByFieldName(from as FieldName);

		return [piece, from as FieldName, to as FieldName, promoteTo];
	}

	getFEN() {
		let fen = '';

		this.board.slice().reverse().map((row, rowId) => {
			let blanks = 0;

			row.map(field => {
				if (field !== '') {
					if (blanks > 0) {
						fen += blanks;
						blanks = 0;
					}
					fen += field;
				} else {
					blanks++;
				}
			});

			if (blanks > 0) fen += blanks;
			if (rowId < this.board.length - 1) fen += '/';
		});

		fen += ` ${this.turn
			} ${this.castle_K ? 'K' : ''
			}${this.castle_Q ? 'Q' : ''
			}${this.castle_k ? 'k' : ''
			}${this.castle_q ? 'q' : ''
			}${(!this.castle_k && !this.castle_q && !this.castle_K && !this.castle_Q) ? '-' : ''
			} ${this.enpassant} ${this.halfmoves} ${this.moves}`;

		return fen;
	}

	loadFen(FEN: string) {
		if (!Chesslogic.isValidFen(FEN)) throw new Error('Invalid FEN');

		this.board = Chesslogic.getBoardFromFen(FEN);

		const [pieces, turn, castles, enpassant, halfmoves, moves] = FEN.split(' ');

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

		// compute possible moves
		this.computeCandidates();
	}

	static isOnBoard([y, x]: FieldCoords) {
		return y >= 0 && y < 8 && x >= 0 && x < 8;
	}

	static sumVectors(a: Vector, b: Vector): FieldCoords {
		return [a[0] + b[0], a[1] + b[1]];
	}

	static isWhite(piece: FieldValue): boolean {
		return isUpperCase(piece);
	}

	static isBlack(piece: FieldValue): boolean {
		return isLowerCase(piece);
	}

	static isValidFen(fen: string): boolean {
		const splittedFen = fen.split(' ');

		if (splittedFen.length !== 6) return false;

		// pieces
		const pieces = splittedFen[0];
		if (!pieces.match(/^([1-8PNBRQK]+\/){7}[1-8PNBRQK]+$/gim)) return false;
		const rows = pieces.split('/');
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			let counter = 0;
			for (let j = 0; j < row.length; j++) {
				const el = row[j];
				const count = Number.isNaN(parseInt(el)) ? 1 : parseInt(el);
				counter += count;
			}
			if (counter !== 8) return false;
		}

		// turn
		if (splittedFen[1] !== 'w' && splittedFen[1] !== 'b') return false;

		// castles
		if (!splittedFen[2].match(/^(-|\bK?Q?k?q?)$/gm)) return false;

		// enpassant
		if (!splittedFen[3].match(/^(-|\b[a-h](3|6))$/gm)) return false;

		// moves counters
		const moves = parseInt(splittedFen[4]);
		const halfmoves = parseInt(splittedFen[5]);
		if (Number.isNaN(moves) || moves < 0 || Number.isNaN(halfmoves) || halfmoves < 0) return false;

		return true;
	}

	static getEmptyBoard(): Board {
		return [
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
			[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
		];
	}

	static getBoardFromFen(fen: string): Board {
		if (!Chesslogic.isValidFen(fen)) throw new Error('Invalid FEN');

		const newBoard: Board = Chesslogic.getEmptyBoard();

		const [pieces] = fen.split(' ');

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

		return newBoard;
	}
}