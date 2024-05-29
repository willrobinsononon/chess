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
        if (this.gameState.currentSelection.piece) {
            this.gameState.currentSelection.piece.deselect();
        }
        this.gameState.currentSelection.piece = this;
        this.gameState.currentSelection.displayMoves(this.gameState);
        this.render.onclick = () => { this.deselect() };
    }

    deselect() {
        if (this.gameState.currentSelection.piece = this) {
            this.gameState.currentSelection.hideMoves(this.gameState);
            this.gameState.currentSelection.piece = false;
        }
        this.render.onclick = () => { this.select() };
    }

    move(newSquare) {

        if (this.gameState.board.squares[newSquare.x][newSquare.y].vacant === false) {
            if (this.gameState.board.squares[newSquare.x][newSquare.y].occupant.color === this.gameState.currentSelection.piece.color) {
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
}

export class King extends Piece {

    maxMoves() {
        return 1;
    }

    hasMoved = false;

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