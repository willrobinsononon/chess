import {King, Queen, Bishop, Knight, Rook, Pawn} from './pieceDefs.js';
import {Board} from './board.js'

document.body.onload = newGame;

//flip button
const flipButton = document.getElementById("flipButton");
flipButton.onclick = () => flipBoard(gameState);

//state variables
const squareSize = 68;
const boardSize = 8;

var gameState = {
    board: {},
    pieces: {},
    currentSelection: false,
    currentTurn: 'white',
    endTurn: endTurn
}

//turn logic

function newTurn(gameState) {
    console.log(gameState)
    //change turn & disable/enable pieces
    if (gameState.currentTurn === 'white') {
        Object.keys(gameState.pieces.black).forEach(key => gameState.pieces.black[key].disable() );
        Object.keys(gameState.pieces.white).forEach(key => gameState.pieces.white[key].enable());
    }
    if (gameState.currentTurn === 'black') {
        Object.keys(gameState.pieces.white).forEach(key => gameState.pieces.white[key].disable() );
        Object.keys(gameState.pieces.black).forEach(key => gameState.pieces.black[key].enable());
    }

    //getMoves
    Object.keys(gameState.pieces[gameState.currentTurn]).forEach(key => gameState.pieces[gameState.currentTurn][key].getMoves());

    //see if in check - if so generate check display and disable all pieces except the king

}

function endTurn(gameState) {
    //repopulate controlled squares
    Object.keys(gameState.pieces[gameState.currentTurn]).forEach(key => gameState.pieces[gameState.currentTurn][key].getMoves());
    if (gameState.currentTurn === 'white') {
        gameState.currentTurn = 'black';
        console.log('test1')
    } else if (gameState.currentTurn === 'black') {
        gameState.currentTurn = 'white';
        console.log('test2')
    }
    newTurn(gameState);
}

function getAllPieces(gameState) {
    var allPieces = [];
    Object.keys(gameState.pieces.black).forEach( key => allPieces.push(gameState.pieces.black[key]));
    Object.keys(gameState.pieces.white).forEach( key => allPieces.push(gameState.pieces.white[key]));
    return allPieces;
}

// flip button logic
function flipBoard(gameState) {
    gameState.board.orientation = gameState.board.orientation * -1;
    var allElements = getAllPieces(gameState);
    if (gameState.currentSelection) {
        allElements = [...allElements, ...gameState.currentSelection.moveDisplays];
    }
    allElements.forEach( (element) => {
        element.updatePosition(element.square);
    })
}

//game set up functions
function createSide(params) {
    var pawns = {};
    for (let i = 0; i < 8; i++) {
            pawns[`pawn${String.fromCharCode(97 + i)}`] = new Pawn({...params, column: i});
    }

    return {
        rooka: new Rook({...params, column: 0}),
        knightb: new Knight({...params, column: 1}),
        bishopc: new Bishop({...params, column: 2}),
        king: new King(params),
        queen: new Queen(params),
        bishopf: new Bishop({...params, column: 5}),
        knightg: new Knight({...params, column: 6}),
        rookh: new Rook({...params, column: 7}),
        ...pawns
    };
}

function newGame() {
    gameState.board = new Board(squareSize, boardSize);
    gameState.pieces = {
        black: createSide({color: 'black', gameState: gameState}),
        white: createSide({color: 'white', gameState: gameState}),
    };
    newTurn(gameState);
}
