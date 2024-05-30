import {OnBoardElement, MoveDisplay, SelectDisplay, PromoteDisplay, PromotionOverlay} from './onBoardElements.js'

class Piece extends OnBoardElement {

    id;
    color;
    availableMoves = [];
    moveDisplays = [];
    pinned = false;
    pinDirections = [];
    isPinning = false;
    isPinningDirection = {};

    constructor(params) {
        super(params);
        //store color and id
        this.color = params.color;
        this.id = params.id;

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
        this.displayMoves(this.availableMoves);
        this.render.onclick = () => { this.deselect() };
    }

    deselect() {
        if (this.gameState.currentSelection = this) {
            this.hideMoves();
            this.gameState.currentSelection = false;
        }
        this.render.onclick = () => { this.select() };
    }

    displayMoves(availableMoves) {
        this.moveDisplays.push(new SelectDisplay({gameState: this.gameState, square: this.square}))
        availableMoves.forEach(move => this.moveDisplays.push(new MoveDisplay({square: move.square, gameState: this.gameState, piece: this, castle: false})));
    }

    hideMoves() {
        this.moveDisplays.forEach(moveDisplay => {
            moveDisplay.render.remove();
        })
    }

    move(newSquare) {

        //capture if possible
        if (this.gameState.board.squares[newSquare.x][newSquare.y].vacant === false) {
            if (this.gameState.board.squares[newSquare.x][newSquare.y].occupant.color === this.gameState.currentSelection.color) {
                return
            }
            else {
                this.capture(this.gameState.board.squares[newSquare.x][newSquare.y].occupant);
            }
        }

        //remove pin if necessary 
        if (
            this.isPinning &&
            (
                this.isPinningDirection.x !== (newSquare.x - this.square.x )/(newSquare.x - this.square.x) ||
                this.isPinningDirection !== (newSquare.y - this.square.y)/(newSquare.y - this.square.y)
            )
        ) {
            this.isPinning.pinDirections = this.isPinning.pinDirections.filter(direction => {
                direction.x === this.isPinningDirection.x &&
                direction.y === this.isPinningDirection.y
            })
            if (this.isPinning.pinDirections.length === 0) {
                this.isPinning.pinned = false;
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

    capture(capturedPiece) {
        //remove render
        capturedPiece.render.remove();

        //remove from pieces
        delete this.gameState.pieces[capturedPiece.color][capturedPiece.id];
    }

    getMoves() {
        var board = this.gameState.board;
        var directions = [...this.directions];
        this.availableMoves = [];

        //check if pin directions is in move directions
        if (this.pinned) {
            if (this.pinDirections.length === 1) {
                directions = [{x: -1 * this.pinDirections.x, y: -1 * this.pinDirections.y}];
            }
            else if (this.pinDirections.length > 1) {
                directions = [];
                
            }
        }

        for (let i in directions) {
            let iteratorSquare = {x: this.square.x + directions[i].x, y: this.square.y + directions[i].y};
            let count = 0;
            while (
                (!this.maxMoves() || count < this.maxMoves() ) &&
                (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
                (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === true)
            ) {
                this.availableMoves.push({square: iteratorSquare, direction: directions[i]});
                if (!this.isPawn()) {
                    board.squares[iteratorSquare.x][iteratorSquare.y].controlledBy[this.color].push(this);
                }
                iteratorSquare = {x: iteratorSquare.x + directions[i].x, y: iteratorSquare.y + directions[i].y};
                count += 1;
            }
            if (
                (!this.isPawn()) &&
                (!this.maxMoves() || count < this.maxMoves() ) &&
                (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
                (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === false && board.squares[iteratorSquare.x][iteratorSquare.y].occupant.color != this.color)
            ) {
                this.availableMoves.push({square: iteratorSquare, direction: directions[i]});
                board.squares[iteratorSquare.x][iteratorSquare.y].controlledBy[this.color].push(this);

                var firstPiece = board.squares[iteratorSquare.x][iteratorSquare.y].occupant;

                iteratorSquare = {x: iteratorSquare.x + directions[i].x, y: iteratorSquare.y + directions[i].y};
                count += 1;

                //fix king running away into check along same axis of attack
                if (
                    firstPiece.isKing() &&
                    (!this.maxMoves() || count < this.maxMoves() ) &&
                    (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) 
                ) {
                    board.squares[iteratorSquare.x][iteratorSquare.y].controlledBy[this.color].push(this);
                }
                else {
                    //check for pins
                    while (
                        (!this.maxMoves() || count < this.maxMoves() ) &&
                        (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
                        (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === true)
                    ) {
                        iteratorSquare = {x: iteratorSquare.x + directions[i].x, y: iteratorSquare.y + directions[i].y};
                        count += 1;
                    }
                    if (
                        (!this.maxMoves() || count < this.maxMoves() ) &&
                        (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
                        (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === false) &&
                        (board.squares[iteratorSquare.x][iteratorSquare.y].occupant.color != this.color && board.squares[iteratorSquare.x][iteratorSquare.y].occupant.isKing())
                     ) {
                            firstPiece.pinned = true;
                            firstPiece.pinDirections.push(directions[i]);
                            this.isPinning = firstPiece;
                            this.isPinningDirection = directions[i];
                        }
                }
            }
        }
    }
}

export class King extends Piece {

    hasMoved = false;
    castlea = false;
    castleh = false;
    directions = allDirections;

    constructor(params) {
        super(params);
        this.render.classList.add("king");
    }

    maxMoves() {
        return 1;
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

    getMoves() {
        super.getMoves();

        var board = this.gameState.board;

        var opponentColor = this.color === 'white' ? 'black' : 'white';

        //add castling square
        if (this.isKing() && this.hasMoved === false) {
            if (
                (this.gameState.pieces[this.color].rooka.hasMoved === false) &&
                (
                    board.squares[1][this.square.y].vacant === true &&
                    board.squares[2][this.square.y].vacant === true &&
                    board.squares[2][this.square.y].controlledBy[opponentColor].length === 0 &&
                    board.squares[3][this.square.y].vacant === true &&
                    board.squares[3][this.square.y].controlledBy[opponentColor].length === 0
                )
            ) {
                this.castlea = true;
            }
            if (
                (this.gameState.pieces[this.color].rookh.hasMoved === false) &&
                (
                    board.squares[6][this.square.y].vacant === true &&
                    board.squares[6][this.square.y].controlledBy[opponentColor].length === 0 &&
                    board.squares[5][this.square.y].vacant === true &&
                    board.squares[5][this.square.y].controlledBy[opponentColor].length === 0
                )
            ) {
                this.castleh = true;
            }
        }

        this.availableMoves.forEach(move => {
            if (
                board.squares[move.square.x][move.square.y].vacant === true &&
                board.squares[move.square.x][move.square.y].controlledBy[opponentColor].length > 0
            ) {
                this.availableMoves = this.availableMoves.filter(item => item != move);
            }
        });
    }

    displayMoves(availableMoves) {
        super.displayMoves(availableMoves);

        if (this.castlea === true) {
            this.moveDisplays.push(new MoveDisplay({square: {x: 2, y: this.square.y}, gameState: this.gameState, piece: this, castle: 'a'}));
        }
        else if (this.castleh === true) {
            this.moveDisplays.push(new MoveDisplay({square: {x: 6, y: this.square.y}, gameState: this.gameState, piece: this, castle: 'h'}));
        }
    }
}

export class Queen extends Piece {

    directions = allDirections;

    constructor(params) {
        super(params);
        this.render.classList.add("queen");
    }

    maxMoves() {
        return false;
    }


}

export class Rook extends Piece {
    
    hasMoved = false;

    directions = straightLines;

    constructor(params) {
        super(params);
        this.render.classList.add("rook");
    }

    maxMoves() {
        return false;
    }

    move(newSquare) {
        if (this.hasMoved === false) {
            this.hasMoved = true;
        }

        super.move(newSquare);
    }
}

export class Knight extends Piece {

    directions = knightHop;

    constructor(params) {
        super(params);
        this.render.classList.add("knight");
    }

    maxMoves() {
        return 1;
    }


}

export class Bishop extends Piece {

    directions = diagonals;

    constructor(params) {
        super(params);
        this.render.classList.add("bishop");
    }

    maxMoves() {
        return false;
    }
}

export class Pawn extends Piece {

    direction;
    directions;

    
    constructor(params) {
        super(params);
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

    maxMoves() {
        if ((this.color === 'white' && this.square.y === 1) || (this.color === 'black' && this.square.y === 6)) {
                return 2;
            }
            else {
                return 1;
            }
    }

    getMoves() {
        super.getMoves();

        var board = this.gameState.board;
        //add pawn attack squares
        if (
            (this.square.y + (1 * this.direction) >= 0) &&
            (this.square.y + (1 * this.direction) < board.squares[0].length)
        ) {
            if (
                this.square.x + 1 < board.squares.length &&
                board.squares[this.square.x + 1][this.square.y + (1 * this.direction)].vacant === false &&
                board.squares[this.square.x + 1][this.square.y + (1 * this.direction)].occupant.color != this.color
            ) {
                this.availableMoves.push({square: {x: this.square.x + 1, y: this.square.y + (1 * this.direction)}, direction: {x: 1, y: 1}});
                board.squares[this.square.x + 1][this.square.y + (1 * this.direction)].controlledBy[this.color].push(this);
            }
            if (
                this.square.x - 1 >= 0 &&
                board.squares[this.square.x - 1][this.square.y + (1 * this.direction)].vacant === false &&
                board.squares[this.square.x - 1][this.square.y + (1 * this.direction)].occupant.color != this.color
            ) {
                this.availableMoves.push({square: {x: this.square.x - 1, y: this.square.y + (1 * this.direction)}, direction: {x: -1, y: 1}});
                board.squares[this.square.x - 1][this.square.y + (1 * this.direction)].controlledBy[this.color].push(this);
            }
        }
    }

    move(newSquare) {
        super.move(newSquare);
        if (this.square.y === 3.5 + this.direction * 3.5) {
            this.promoteDisplay();
        }
    }

    promoteDisplay() {
        //set game to promotion mode
        this.gameState.promotion = true;

        //disable all pieces
        Object.keys(this.gameState.pieces[this.color]).forEach(key => this.gameState.pieces[this.color][key].disable());

        //hide this render
        this.render.remove();

        //create promotedisplays
        this.moveDisplays.push(new PromoteDisplay({piece: this, promoteTo: Queen, promoteClass: "queen", square: this.square, gameState: this.gameState}));
        this.moveDisplays.push(new PromoteDisplay({piece: this, promoteTo: Rook, promoteClass: "rook", square: {x: this.square.x, y: this.square.y - this.direction}, gameState: this.gameState}));
        this.moveDisplays.push(new PromoteDisplay({piece: this, promoteTo: Bishop, promoteClass: "bishop", square: {x: this.square.x, y: this.square.y - 2 * this.direction}, gameState: this.gameState}));
        this.moveDisplays.push(new PromoteDisplay({piece: this, promoteTo: Knight, promoteClass: "knight", square: {x: this.square.x, y: this.square.y - 3 * this.direction}, gameState: this.gameState}));

        //create board overlay
        this.moveDisplays.push(new PromotionOverlay(this.gameState));
    }

    promote(Piece) {
        this.moveDisplays.forEach(moveDisplay => moveDisplay.render.remove());
        this.moveDisplays = [];
        this.gameState.pieces[this.color][this.id] = new Piece({color: this.color, gameState: this.gameState, square: this.square, id: this.id});
        this.gameState.promotion = false;
        this.gameState.endTurn(this.gameState);
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