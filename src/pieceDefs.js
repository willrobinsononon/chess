export class OnBoardElement {
    render = document.createElement("div");

    square;
    gameState;

    constructor(params) {
        //store references to external variables
        
        this.gameState = params.gameState;
        this.square = params.square;

        //create render paramaters
        this.render.style.width = this.gameState.board.squareSize;
        this.render.style.height = this.gameState.board.squareSize;
        this.updatePosition(this.square);
        this.gameState.board.render.appendChild(this.render);
    }

    updatePosition(newSquare) {
        this.render.style.transform = `translate(${(3.5 - this.gameState.board.orientation * (3.5 - newSquare.x)) * this.gameState.board.squareSize}px, ${(3.5 + this.gameState.board.orientation * (3.5 - newSquare.y)) * this.gameState.board.squareSize}px)`
    }

}

class Piece extends OnBoardElement {

    color;
    availableMoves = [];
    moveDisplays = [];

    constructor(params) {
        super(params);
        //store color
        this.color = params.color;

        //create piece specific render paramaters
        this.render.classList.add('piece');
        this.render.classList.add(this.color);

        //store square and populate board
        this.gameState.board.squares[this.square.x][this.square.y].vacant = false;
        this.gameState.board.squares[this.square.x][this.square.y].occupant = this;
    }

    enable() {
        this.render.onclick = () => { this.select() };
        this.render.classList.remove('disabled');
    }

    disable() {
        this.render.onclick = false;
        this.render.classList.add('disabled');
    }

    select() {
        if (this.gameState.currentSelection) {
            this.gameState.currentSelection.deselect();
        }
        this.gameState.currentSelection = this;
        this.displayMoves();
        this.render.onclick = () => { this.deselect() };
    }

    deselect() {
        if (this.gameState.currentSelection = this) {
            this.hideMoves();
            this.gameState.currentSelection = false;
        }
        this.render.onclick = () => { this.select() };
    }

    displayMoves() {
        this.moveDisplays.push(new SelectDisplay({gameState: this.gameState, square: this.square}))
        this.availableMoves.forEach(square => this.moveDisplays.push(new MoveDisplay({square: square, gameState: this.gameState, piece: this, castle: false})));
        
        if (this.isKing && this.castlea === true) {
            this.moveDisplays.push(new MoveDisplay({square: {x: 2, y: this.square.y}, gameState: this.gameState, piece: this, castle: 'a'}));
        }
        else if (this.isKing() && this.castleh === true) {
            this.moveDisplays.push(new MoveDisplay({square: {x: 6, y: this.square.y}, gameState: this.gameState, piece: this, castle: 'h'}));
        }
    }

    hideMoves() {
        this.moveDisplays.forEach(moveDisplay => {
            moveDisplay.render.remove();
        })
    }

    move(newSquare) {

        if (this.gameState.board.squares[newSquare.x][newSquare.y].vacant === false) {
            if (this.gameState.board.squares[newSquare.x][newSquare.y].occupant.color === this.gameState.currentSelection.color) {
                return
            }
            else {
                this.capture(newSquare);
            }
        }

        //deselect
        this.deselect();

        //update board and set square
        this.gameState.board.squares[this.square.x][this.square.y].vacant = true;
        this.gameState.board.squares[this.square.x][this.square.y].occupant = {};
        this.square = newSquare;
        this.gameState.board.squares[this.square.x][this.square.y].vacant = false;
        this.gameState.board.squares[this.square.x][this.square.y].occupant = this;
        
        this.updatePosition(newSquare);

        this.gameState.endTurn(this.gameState);
    }

    isPawn() {
        return this instanceof Pawn;
    }

    isKing() {
        return this instanceof King;
    }

    isRook() {
        return this instanceof Rook;
    }

    capture(square) {
        this.gameState.board.squares[square.x][square.y].occupant.render.remove();
        //remove from white / black pieces and add to score
    }

    getMoves() {
        var board = this.gameState.board;

        this.availableMoves = [];
        board.squares.forEach(column => column.forEach(square => square.controlledBy[this.color] = false));
        for (let i in this.directions) {
            let iteratorSquare = {x: this.square.x + this.directions[i].x, y: this.square.y + this.directions[i].y};
            let count = 0;
            while (
                (!this.maxMoves() || count < this.maxMoves() ) &&
                (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
                (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === true)
            ) {
                
                this.availableMoves.push(iteratorSquare);
                board.squares[iteratorSquare.x][iteratorSquare.y].controlledBy[this.color] = true;
                iteratorSquare = {x: iteratorSquare.x + this.directions[i].x, y: iteratorSquare.y + this.directions[i].y};
                count += 1;
            }
            if (
                (!this.isPawn()) &&
                (!this.maxMoves() || count < this.maxMoves() ) &&
                (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
                (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === false && board.squares[iteratorSquare.x][iteratorSquare.y].occupant.color != this.color)
            ) {
                this.availableMoves.push(iteratorSquare);
                board.squares[iteratorSquare.x][iteratorSquare.y].controlledBy[this.color] = true;
            }
        }

        //add pawn attack squares
        if (
            this.isPawn() && 
            (this.square.y + (1 * this.direction) >= 0) &&
            (this.square.y + (1 * this.direction) < board.squares[0].length)
        ) {
            if (
                this.square.x + 1 < board.squares.length &&
                board.squares[this.square.x + 1][this.square.y + (1 * this.direction)].vacant === false &&
                board.squares[this.square.x + 1][this.square.y + (1 * this.direction)].occupant.color != this.color
            ) {
                this.availableMoves.push({x: this.square.x + 1, y: this.square.y + (1 * this.direction)});
                board.squares[this.square.x + 1][this.square.y + (1 * this.direction)].controlledBy[this.color] = true;
            }
            if (
                this.square.x - 1 >= 0 &&
                board.squares[this.square.x - 1][this.square.y + (1 * this.direction)].vacant === false &&
                board.squares[this.square.x - 1][this.square.y + (1 * this.direction)].occupant.color != this.color
            ) {
                this.availableMoves.push({x: this.square.x - 1, y: this.square.y + (1 * this.direction)});
                board.squares[this.square.x - 1][this.square.y + (1 * this.direction)].controlledBy[this.color] = true;
            }
        }

        //add castling square
        if (this.isKing() && this.hasMoved === false) {
            if (
                (this.gameState.pieces[this.color].rooka.hasMoved === false) &&
                (
                    board.squares[1][this.square.y].vacant === true &&
                    board.squares[2][this.square.y].vacant === true
                )
            ) {
                this.castlea = true;
            }
            if (
                (this.gameState.pieces[this.color].rookh.hasMoved === false) &&
                (
                    board.squares[6][this.square.y].vacant === true &&
                    board.squares[5][this.square.y].vacant === true
                )
            ) {
                this.castleh = true;
            }
        }
    }
}

export class King extends Piece {

    maxMoves() {
        return 1;
    }

    hasMoved = false;
    castlea = false;
    castleh = false;

    directions = allDirections;

    constructor(params) {
        super({...params, square: {x:4, y: params.color==='white' ? 0 : 7}});
        this.render.classList.add("king");
    }

    move(newSquare) {
        if (this.hasMoved === false) {
            this.hasMoved = true;
        }

        super.move(newSquare);
    }
    
    castle(square, castle) {
        this.move(square);
        if (castle === 'a') {
            this.gameState.pieces[this.color].rooka.move({x: 3, y: this.square.y});
        }
        else if (castle === 'h') {
            this.gameState.pieces[this.color].rookh.move({x: 5, y: this.square.y});
        }
    }
}

export class Queen extends Piece {
    
    maxMoves() {
        return false;
    }

    directions = allDirections;

    constructor(params) {
        super({...params, square: {x:3, y: params.color==='white' ? 0 : 7}});
        this.render.classList.add("queen");
    }
}

export class Rook extends Piece {
    
    maxMoves() {
        return false;
    }

    move(newSquare) {
        if (this.hasMoved === false) {
            this.hasMoved = true;
        }

        super.move(newSquare);
    }

    hasMoved = false;

    directions = straightLines;

    constructor(params) {
        super({...params, square: {x:params.column, y: params.color==='white' ? 0 : 7}});
        this.render.classList.add("rook");
    }
}

export class Knight extends Piece {

    maxMoves() {
        return 1;
    }

    directions = knightHop;

    constructor(params) {
        super({...params, square: {x:params.column, y: params.color==='white' ? 0 : 7}});
        this.render.classList.add("knight");
    }
}

export class Bishop extends Piece {

    maxMoves() {
        return false;
    }

    directions = diagonals;

    constructor(params) {
        super({...params, square: {x:params.column, y: params.color==='white' ? 0 : 7}});
        this.render.classList.add("bishop");
    }
}

export class Pawn extends Piece {

    maxMoves() {
        if ((this.color === 'white' && this.square.y === 1) || (this.color === 'black' && this.square.y === 6)) {
                return 2;
            }
            else {
                return 1;
            }
    }

    direction;
    directions;

    
    constructor(params) {
        super({...params, square: {x:params.column, y: params.color==='white' ? 1 : 6}});
        this.render.classList.add("pawn");
        if (this.color === 'white') {
            this.directions = [{x: 0, y: 1}];
            this.direction = 1;
        }
        else if (this.color === 'black') {
            this.directions = [{x: 0, y: -1}];
            this.direction = -1;
        }
    }
}


//move definitions

function moveConstructor(moves) {
    let x = 0;
    let y = 0;
    moves.forEach(move => {
        x += move.x;
        y += move.y
    });

    return {x: x, y: y};
}

const forward = {x: 0, y: 1};
const backward = {x: 0, y: -1};
const left = {x: -1, y: 0};
const right = {x: 1, y: 0};

var straightLines = [
    forward,
    backward,
    left,
    right
];

var diagonals =  [
    moveConstructor([forward, left]),
    moveConstructor([forward, right]),
    moveConstructor([backward, left]),
    moveConstructor([backward, right])
];

var allDirections = [...straightLines, ...diagonals];

var knightHop = [
    moveConstructor([forward, forward, left]),
    moveConstructor([forward, forward, right]),
    moveConstructor([forward, left, left]),
    moveConstructor([forward, right, right]),
    moveConstructor([backward, backward, left]),
    moveConstructor([backward, backward, right]),
    moveConstructor([backward, left, left]),
    moveConstructor([backward, right, right])
];



//Move Displays

class MoveDisplay extends OnBoardElement {

    piece;
    castle;

    constructor(params) {
        super(params);
        this.render.classList.add("moveDisplay");
        this.piece = params.piece
        this.castle = params.castle;

        this.render.onclick = () => { this.movePiece(this.square); };
    }

    movePiece(square) {
        if (this.castle) {
            this.piece.castle(square, this.castle);
        }
        else {
            this.piece.move(square);
        }
    }
}

class SelectDisplay extends OnBoardElement {

    constructor(params) {
        super(params);
        this.render.classList.add("selDisplay");
    }
}