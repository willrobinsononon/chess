class MoveDisplay {
    render = document.createElement("div");

    square;

    constructor(square, board, currentSelection) {
        this.render.classList.add("moveDisplay");
        this.render.style.width = board.squareSize;
        this.render.style.height = board.squareSize;
        this.square = square;
        this.render.style.transform = `translate(${square.x * board.squareSize}px, ${(7 - square.y) * board.squareSize}px)`;
        this.render.onclick = () => { this.moveCurrentSelection(square, board, currentSelection); };
        board.render.appendChild(this.render);
    }

    moveCurrentSelection(square, board, currentSelection ) {
        currentSelection.piece.move(square, board, currentSelection);
    }

}

export function displayMoves(currentSelection, board) {

    //document.querySelectorAll(".selDisplay").forEach(e => e.remove());
    currentSelection.moveDisplays.forEach(e => {
        e.render.remove();
    })
    currentSelection.moveDisplays = [];
    //new selDisplay(this.currentSquare);
    let directions = currentSelection.piece.directions;
    let maxMoves = currentSelection.piece.maxMoves();
    for (let i in directions) {
        let iteratorSquare = {x: currentSelection.piece.currentSquare.x + directions[i].x, y: currentSelection.piece.currentSquare.y + directions[i].y};
        let count = 0;
        while (
            (!maxMoves || count < maxMoves ) &&
            (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
            (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === true)
        ) {
            currentSelection.moveDisplays.push(new MoveDisplay(iteratorSquare, board, currentSelection));
            iteratorSquare = {x: iteratorSquare.x + directions[i].x, y: iteratorSquare.y + directions[i].y};
            count += 1;
        }
        if (
            (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
            (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === false && board.squares[iteratorSquare.x][iteratorSquare.y].occupant.color != currentSelection.piece.color)
        ) {
            currentSelection.moveDisplays.push(new MoveDisplay(iteratorSquare, board, currentSelection));
        }
    }
}

export function hideMoves(currentSelection) {
    currentSelection.moveDisplays.forEach(e => {
        e.render.remove();
    })
    currentSelection.moveDisplays = [];
    //document.querySelectorAll(".selDisplay").forEach(e => e.remove());
}