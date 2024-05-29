import {OnBoardElement} from './pieceDefs.js';

class MoveDisplay extends OnBoardElement {


    constructor(params) {
        super(params);
        this.render.classList.add("moveDisplay");

        this.render.onclick = () => { this.moveCurrentSelection(this.square); };
    }

    moveCurrentSelection(square) {
        this.gameState.currentSelection.piece.move(square);
    }
}

class selDisplay extends OnBoardElement {

    constructor(params) {
        super({...params, square: params.gameState.currentSelection.piece.square});
        this.render.classList.add("selDisplay");
    }
}

class CastlingSquare extends MoveDisplay {

    rookCastleParams = {
        rookToMove: false,
        rookCastlingSquare: {}
    };

    constructor(params) {
        super(params);
        
        if (this.square.x === 2) {
            this.rookCastleParams.rookToMove = this.gameState.board.squares[0][this.gameState.currentSelection.piece.square.y].occupant;
            this.rookCastleParams.rookCastlingSquare = {x: 3, y: this.gameState.currentSelection.piece.square.y};
        }
        else if (this.square.x ===6) {
            this.rookCastleParams.rookToMove = this.gameState.board.squares[7][this.gameState.currentSelection.piece.square.y].occupant;
            this.rookCastleParams.rookCastlingSquare = {x: 5, y: this.gameState.currentSelection.piece.square.y};
        }
    }

    moveCurrentSelection(square) {
        this.gameState.currentSelection.piece.move(square);
        this.rookCastleParams.rookToMove.move(this.rookCastleParams.rookCastlingSquare);
    }

}


export function displayMoves(gameState) {
    var selPiece = gameState.currentSelection.piece;
    var moveDisplays = gameState.currentSelection.moveDisplays;
    var board = gameState.board;

    moveDisplays.push(new selDisplay({gameState: gameState}));
    let directions = selPiece.directions;
    let maxMoves = selPiece.maxMoves();
    for (let i in directions) {
        let iteratorSquare = {x: selPiece.square.x + directions[i].x, y: selPiece.square.y + directions[i].y};
        let count = 0;
        while (
            (!maxMoves || count < maxMoves ) &&
            (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
            (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === true)
        ) {
            moveDisplays.push(new MoveDisplay({square: iteratorSquare, gameState: gameState}));
            iteratorSquare = {x: iteratorSquare.x + directions[i].x, y: iteratorSquare.y + directions[i].y};
            count += 1;
        }
        if (
            (!selPiece.isPawn()) &&
            (!maxMoves || count < maxMoves ) &&
            (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
            (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === false && board.squares[iteratorSquare.x][iteratorSquare.y].occupant.color != selPiece.color)
        ) {
            moveDisplays.push(new MoveDisplay({square: iteratorSquare, gameState: gameState}));
        }
    }

     //add pawn attack squares
     if (
        selPiece.isPawn() && 
        (selPiece.square.y + (1 * selPiece.direction) >= 0) &&
        (selPiece.square.y + (1 * selPiece.direction) < board.squares[0].length)
    ) {
        if (
            selPiece.square.x + 1 < board.squares.length &&
            board.squares[selPiece.square.x + 1][selPiece.square.y + (1 * selPiece.direction)].vacant === false &&
            board.squares[selPiece.square.x + 1][selPiece.square.y + (1 * selPiece.direction)].occupant.color != selPiece.color
        ) {
            moveDisplays.push(new MoveDisplay({square: {x: selPiece.square.x + 1, y: selPiece.square.y + (1 * selPiece.direction)}, gameState: gameState}));
        }
        if (
            selPiece.square.x - 1 >= 0 &&
            board.squares[selPiece.square.x - 1][selPiece.square.y + (1 * selPiece.direction)].vacant === false &&
            board.squares[selPiece.square.x - 1][selPiece.square.y + (1 * selPiece.direction)].occupant.color != selPiece.color
        ) {
            moveDisplays.push(new MoveDisplay({square: {x: selPiece.square.x - 1, y: selPiece.square.y + (1 * selPiece.direction)}, gameState: gameState}));
        }
    }

    //add castling square
    if (selPiece.isKing() && selPiece.hasMoved === false) {
        if (
            (gameState.pieces[selPiece.color].rooka.hasMoved === false) &&
            (
                board.squares[1][selPiece.square.y].vacant === true &&
                board.squares[2][selPiece.square.y].vacant === true
            )
        ) {
            moveDisplays.push(new CastlingSquare({square: {x: 2, y: selPiece.square.y}, gameState: gameState}));
        }
        if (
            (gameState.pieces[selPiece.color].rookh.hasMoved === false) &&
            (
                board.squares[6][selPiece.square.y].vacant === true &&
                board.squares[5][selPiece.square.y].vacant === true
            )
        ) {
            moveDisplays.push(new CastlingSquare({square: {x: 6, y: selPiece.square.y}, gameState: gameState}));
        }
    }
}

export function hideMoves(gameState) {
    var moveDisplays = gameState.currentSelection.moveDisplays;

    moveDisplays.forEach(e => {
        e.render.remove();
    })
    moveDisplays = [];
}