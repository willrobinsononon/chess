export class Board {

    render = document.getElementById("board");

    squareSize;
    boardSize;
    squares = [];

    constructor(squareSize, boardSize) {
        this.squareSize = squareSize;
        this.boardSize = boardSize;
        this.render.style.width = squareSize * boardSize;
        this.render.style.height = squareSize * boardSize;

        for (let i = 0; i < boardSize; i++) {
            let column = [];
            for (let i = 0; i < boardSize; i++) {
                column.push(new Square);
            }
            this.squares.push(column);
        }
    }
}

class Square {
    vacant = true;
    occupant = {};
}