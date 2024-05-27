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

class selDisplay {
    render = document.createElement("div");

    constructor(square, board) {
        this.render.classList.add("selDisplay");
        this.render.style.width = board.squareSize;
        this.render.style.height = board.squareSize;
        this.render.style.transform = `translate(${square.x * board.squareSize}px, ${(7 - square.y) * board.squareSize}px)`;
        board.render.appendChild(this.render);
    }
}


export function displayMoves(currentSelection, board) {
    new selDisplay(currentSelection.piece.currentSquare, board);
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
            (!currentSelection.piece.isPawn()) &&
            (!maxMoves || count < maxMoves ) &&
            (iteratorSquare.x >= 0 && iteratorSquare.y >= 0 && iteratorSquare.x < board.squares.length && iteratorSquare.y < board.squares[0].length) &&
            (board.squares[iteratorSquare.x][iteratorSquare.y].vacant === false && board.squares[iteratorSquare.x][iteratorSquare.y].occupant.color != currentSelection.piece.color)
        ) {
            currentSelection.moveDisplays.push(new MoveDisplay(iteratorSquare, board, currentSelection));
        }
        if (
            currentSelection.piece.isPawn() && 
            (currentSelection.piece.currentSquare.y + (1 * currentSelection.piece.direction) > 0) &&
            (currentSelection.piece.currentSquare.y + (1 * currentSelection.piece.direction) < board.squares[0].length)
        ) {
            if (
                board.squares[currentSelection.piece.currentSquare.x + 1][currentSelection.piece.currentSquare.y + (1 * currentSelection.piece.direction)].vacant === false &&
                board.squares[currentSelection.piece.currentSquare.x + 1][currentSelection.piece.currentSquare.y + (1 * currentSelection.piece.direction)].occupant.color != currentSelection.piece.color
            ) {
                console.log('test1')
                currentSelection.moveDisplays.push(new MoveDisplay({x: currentSelection.piece.currentSquare.x + 1, y: currentSelection.piece.currentSquare.y + (1 * currentSelection.piece.direction)}, board, currentSelection));
            }
            if (
                board.squares[currentSelection.piece.currentSquare.x - 1][currentSelection.piece.currentSquare.y + (1 * currentSelection.piece.direction)].vacant === false &&
                board.squares[currentSelection.piece.currentSquare.x - 1][currentSelection.piece.currentSquare.y + (1 * currentSelection.piece.direction)].occupant.color != currentSelection.piece.color
            ) {
                console.log('test2');
                currentSelection.moveDisplays.push(new MoveDisplay({x: currentSelection.piece.currentSquare.x - 1, y: currentSelection.piece.currentSquare.y + (1 * currentSelection.piece.direction)}, board, currentSelection));
            }
        }
    }
}

export function hideMoves(currentSelection) {
    currentSelection.moveDisplays.forEach(e => {
        e.render.remove();
    })
    currentSelection.moveDisplays = [];
    document.querySelectorAll(".selDisplay").forEach(e => e.remove());
}