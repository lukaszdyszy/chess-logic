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

export enum WhatePiece {
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

export type Piece = `${WhatePiece | BlackPiece}`;

export type RowName = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type ColName = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type FieldName = `${ColName}${RowName}`;


export class Chesslogic { }