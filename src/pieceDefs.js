class Piece {
    render = document.createElement("div");

    color;
    currentSquare;

    constructor(startSquare, color, board, currentSelection) {
        this.color = color;
        this.render.classList.add(color);
        this.render.classList.add('piece');
        this.currentSquare = startSquare;
        board.squares[startSquare.x][startSquare.y].vacant = false;
        board.squares[startSquare.x][startSquare.y].occupant = this;

        this.render.style.width = board.squareSize;
        this.render.style.height = board.squareSize;
        this.render.style.transform = `translate(${startSquare.x * board.squareSize}px, ${(7 - startSquare.y) * board.squareSize}px)`

        this.render.onclick = () => { this.select(currentSelection, board) };
        board.render.appendChild(this.render);
    }

    select(currentSelection, board) {
        if (currentSelection.piece) {
            currentSelection.piece.deselect(currentSelection, board);
        }
        currentSelection.piece = this;
        currentSelection.displayMoves(currentSelection, board);
        this.render.onclick = () => { this.deselect(currentSelection, board) };
    }

    deselect(currentSelection, board) {
        if (currentSelection.piece = this) {
            currentSelection.hideMoves(currentSelection);
            currentSelection.piece = false;
        }
        this.render.onclick = () => { this.select(currentSelection, board) };
    }

    move(newSquare, board, currentSelection) {

        //deselect
        this.deselect(currentSelection, board);

        //update board and set currentsquare
        board.squares[this.currentSquare.x][this.currentSquare.y].vacant = true;
        board.squares[this.currentSquare.x][this.currentSquare.y].occupant = {};
        this.currentSquare = newSquare;
        board.squares[this.currentSquare.x][this.currentSquare.y].vacant = false;
        board.squares[this.currentSquare.x][this.currentSquare.y].occupant = this;

        //change transform for display
        this.render.style.transform = `translate(${this.currentSquare.x * board.squareSize}px, ${(7 - this.currentSquare.y) * board.squareSize}px)`
    }
}

export class King extends Piece {

    maxMoves() {
        return 1;
    }

    directions = allDirections;

    constructor(color, board, currentSelection) {
        super({x:4, y: color==='white' ? 0 : 7}, color, board, currentSelection);
        this.render.classList.add("king");
        this.render.style.backgroundImage = `url("static/pieces/${color}/king.png")`;
    }
}

export class Queen extends Piece {
    
    maxMoves() {
        return false;
    }

    directions = allDirections;

    constructor(color, board, currentSelection) {
        super({x:3, y: color==='white' ? 0 : 7}, color, board, currentSelection);
        this.render.classList.add("queen");
        this.render.style.backgroundImage = `url("static/pieces/${color}/queen.png")`;
    }
}

export class Rook extends Piece {
    
    maxMoves() {
        return false;
    }

    directions = straightLines;

    constructor(color, column, board, currentSelection) {
        super({x:column, y: color==='white' ? 0 : 7}, color, board, currentSelection);
        this.render.classList.add("rook");
        this.render.style.backgroundImage = `url("static/pieces/${color}/rook.png")`;
    }
}

export class Knight extends Piece {

    maxMoves() {
        return 1;
    }

    directions = knightHop;

    constructor(color, column, board, currentSelection) {
        super({x:column, y: color==='white' ? 0 : 7}, color, board, currentSelection);
        this.render.classList.add("knight");
        this.render.style.backgroundImage = `url("static/pieces/${color}/knight.png")`;
    }
}

export class Bishop extends Piece {

    maxMoves() {
        return false;
    }

    directions = diagonals;

    constructor(color, column, board, currentSelection) {
        super({x:column, y: color==='white' ? 0 : 7}, color, board, currentSelection);
        this.render.classList.add("bishop");
        this.render.style.backgroundImage = `url("static/pieces/${color}/bishop.png")`;
    }
}

export class Pawn extends Piece {

    maxMoves() {
        if ((this.color === 'white' && this.currentSquare.y === 1) || (this.color === 'black' && this.currentSquare.y === 6)) {
                return 2;
            }
            else {
                return 1;
            }
    }

    directions;
    
    constructor(color, column, board, currentSelection) {
        super({x:column, y: color==='white' ? 1 : 6}, color, board, currentSelection);
        this.render.classList.add("pawn");
        this.render.style.backgroundImage = `url("static/pieces/${color}/pawn.png")`;
        if (this.color === 'white') {
            this.directions = [{x: 0, y: 1}];
        }
        else if (this.color === 'black') {
            this.directions = [{x: 0, y: -1}];
        }
    }
}


//move definitions

var straightLines = [
    {x: 1, y: 0},
    {x: -1, y: 0},
    {x: 0, y: 1},
    {x: 0, y: -1}
];

var diagonals =  [
    {x: 1, y: 1},
    {x: 1, y: -1},
    {x: -1, y: 1},
    {x: -1, y: -1}
];

var allDirections = [...straightLines, ...diagonals];

var knightHop = [
    {x: 2, y: 1},
    {x: 2, y: -1},
    {x: 1, y: 2},
    {x: 1, y: -2},
    {x: -1, y: 2},
    {x: -1, y: -2},
    {x: -2, y: 1},
    {x: -2, y: -1}
];

var forward = [{x: 0, y: 1}];

var pawnAttackLeft = [{x: 1, y: 1}, {x: -1, y: 1}];