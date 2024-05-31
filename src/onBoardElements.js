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

//Move Displays

export class MoveDisplay extends OnBoardElement {

    piece;

    constructor(params) {
        super(params);
        this.render.classList.add("moveDisplay");
        this.piece = params.piece
        this.castle = params.castle;

        this.render.onclick = () => { this.makeMove(this.square); };
    }

    makeMove(square) {
        this.piece.move(square);
        this.gameState.endTurn(this.gameState);
    }
}

export class SelectDisplay extends OnBoardElement {

    constructor(params) {
        super(params);
        this.render.classList.add("selDisplay");
    }
}

export class CheckDisplay extends OnBoardElement {

    constructor(params) {
        super(params);
        this.render.classList.add("checkDisplay");
    }
}