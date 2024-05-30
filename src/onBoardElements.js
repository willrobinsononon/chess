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
    castle;

    constructor(params) {
        super(params);
        this.render.classList.add("moveDisplay");
        this.piece = params.piece
        this.castle = params.castle;

        this.render.onclick = () => { this.makeMove(this.square); };
    }

    makeMove(square) {
        if (this.castle) {
            this.piece.castle(square, this.castle);
        }
        else {
            this.piece.move(square);
        }
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

export class PromoteDisplay extends OnBoardElement {

    piece;
    promoteTo;

    constructor(params) {
        super(params);
        this.piece = params.piece;
        this.promoteTo = params.promoteTo;

        this.render.classList.add("promoteDisplay");
        this.render.classList.add(this.piece.color);
        this.render.classList.add(params.promoteClass);
        
        this.render.onclick = () => { this.piece.promote(this.promoteTo); };
    }
}

export class PromotionOverlay {
    render = document.createElement("div");

    gameState;

    constructor(gameState) {
        //store references to external variables
        
        this.gameState = gameState;

        //create render paramaters
        this.render.style.width = this.gameState.board.squareSize * this.gameState.board.boardSize;
        this.render.style.height = this.gameState.board.squareSize * this.gameState.board.boardSize;
        this.render.classList.add("promotionOverlay");
        this.gameState.board.render.appendChild(this.render);
    }
}