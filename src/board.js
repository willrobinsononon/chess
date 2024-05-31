export class Board {
    
    render;
    squareSize;
    boardSize;
    squares = [];
    orientation = 1;

    constructor(params) {
        this.render = params.render;
        this.squareSize = params.squareSize;
        this.boardSize = params.boardSize;
        this.render.style.width = params.squareSize * params.boardSize;
        this.render.style.height = params.squareSize * params.boardSize;

        for (let i = 0; i < params.boardSize; i++) {
            let column = [];
            for (let i = 0; i < params.boardSize; i++) {
                column.push(new Square);
            }
            this.squares.push(column);
        }
    }
}

class Square {
    vacant = true;
    occupant = {};
    controlledBy = {
        white: [],
        black: []
    }
}