import {King, Queen, Bishop, Knight, Rook, Pawn} from './pieceDefs.js';
import {displayMoves, hideMoves} from './moveDisplays.js'
import {Board} from './board.js'

const squareSize = 68;
const boardSize = 8;
var board;
var pieces;

document.body.onload = newGame;
const flipButton = document.getElementById("flipButton");
flipButton.onclick = () => flipBoard(pieces, board, currentSelection);

function flipBoard(pieces, board, currentSelection) {
    board.orientation = board.orientation * -1;
    var allPieces = [];
    Object.keys(pieces.blackPieces).forEach( key => allPieces.push(pieces.blackPieces[key]));
    Object.keys(pieces.whitePieces).forEach( key => allPieces.push(pieces.whitePieces[key]));
    var allElements = [...allPieces, ...currentSelection.moveDisplays];
    allElements.forEach( (element) => {
        element.render.style.transform = `translate(${element.square.x * board.squareSize}px, ${(3.5 + board.orientation * (3.5 - element.square.y)) * board.squareSize}px)`;
    })
}

var currentSelection = {
    piece: false,
    displayMoves: displayMoves,
    hideMoves: hideMoves,
    moveDisplays: []
};

//game creation functions

function createSide(color, board) {
    var pawns = {};
    for (let i = 0; i < 8; i++) {
            pawns[`pawn${String.fromCharCode(97 + i)}`] = new Pawn(color, i, board, currentSelection);
    }

    return {
        rook1: new Rook(color, 0, board, currentSelection),
        knight1: new Knight(color, 1, board, currentSelection),
        bishop1: new Bishop(color, 2, board, currentSelection),
        king: new King(color, board, currentSelection),
        queen: new Queen(color, board, currentSelection),
        bishop2: new Bishop(color, 5, board, currentSelection),
        knight2: new Knight(color, 6, board, currentSelection),
        rook2: new Rook(color, 7, board, currentSelection),
        ...pawns
    };
}

function newGame() {
    board = new Board(squareSize, boardSize);
    pieces = {
        blackPieces: createSide('black', board),
        whitePieces: createSide('white', board)
    };
}
