import {King, Queen, Bishop, Knight, Rook, Pawn} from './pieceDefs.js';
import {displayMoves, hideMoves} from './moveDisplays.js'
import {Board} from './board.js'

document.body.onload = newGame;

var currentSelection = {
    piece: false,
    displayMoves: displayMoves,
    hideMoves: hideMoves,
    moveDisplays: []
};

class selDisplay {
    render = document.createElement("div");

    constructor(square) {
        this.render.classList.add("selDisplay");
        this.render.style.width = board.squareSize;
        this.render.style.height = board.squareSize;
        this.render.style.transform = `translate(${square.x * board.squareSize}px, ${(7 - square.y) * board.squareSize}px)`;
        board.render.appendChild(this.render);
    }
}


//game creation functions

function createSide(color, board) {
    var pawns = [];
    for (let i = 0; i < 8; i++) {
            pawns[i] = new Pawn(color, i, board, currentSelection);
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
        pawns: pawns
    };
}

function newGame() {
    var squareSize = 68;
    var boardSize = 8;
    var board = new Board(squareSize, boardSize);
    var blackPieces = createSide('black', board);
    var whitePieces = createSide('white', board);
}
