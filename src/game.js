import {King, Queen, Bishop, Knight, Rook, Pawn} from './pieceDefs.js';
import {Board} from './board.js'
import { CheckDisplay } from './onBoardElements.js';

//starting function
document.body.onload = newGame;

//set state variables
var squareSize = 68;
const boardSize = 8;
const timeLimit = 5 * 60 * 10; //tenth of a second accuracy

var gameState = {
    board: {},
    pieces: {},
    currentSelection: false,
    currentTurn: 'white',
    endTurn: endTurn,
    gameStatusRender: document.getElementById("game-status"),
    checkDisplay: false,
    promotion: false,
    timers: {
        white: {
            timeLeft: timeLimit,
            render: document.getElementById("white-time")
        },
        black: {
            timeLeft: timeLimit,
            render: document.getElementById("black-time")
        }
    },
    currentTimer: false
}
//display timers
gameState.timers.white.render.innerHTML = timeFormat(gameState.timers.white.timeLeft);
gameState.timers.black.render.innerHTML = timeFormat(gameState.timers.black.timeLeft);

//resize function
window.onresize = () => {
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
}

//flip button
const flipButton = document.getElementById("flip-button");
flipButton.onclick = () => flipBoard(gameState);

// flip button logic
function flipBoard(gameState) {
    gameState.board.orientation = gameState.board.orientation * -1;
    var allElements = getAllPieces(gameState);
    if (gameState.currentSelection) {
        allElements = [...allElements, ...gameState.currentSelection.moveDisplays];
    }
    allElements.forEach( (element) => {
        element.updateDisplay(element.square);
    })
}

//timer
function startTimer(gameState) {
    let timer = gameState.timers[gameState.currentTurn]
    gameState.currentTimer = setInterval(() => {
        timer.timeLeft -= 1;
        timer.render.innerHTML = timeFormat(timer.timeLeft);
    } , 100);
}

function stopTimer(gameState) {
    clearInterval(gameState.currentTimer);
}

function timeFormat(timeLeft) {
    let seconds = Math.ceil(timeLeft/10);
    return `${Math.floor(seconds/60)}:${Math.floor((seconds%60)/10)}${seconds%10}`;
}

//turn logic
function newTurn(gameState) {
    var opponentColor = gameState.currentTurn === 'white' ? 'black' : 'white';
    var thisSide = gameState.pieces[gameState.currentTurn];

    //game display on screen
    gameState.gameStatusRender.innerHTML = `${gameState.currentTurn.charAt(0).toUpperCase() + gameState.currentTurn.slice(1)} to move`;

    //disable opponent pieces
    Object.keys(gameState.pieces[opponentColor]).forEach(key => gameState.pieces[opponentColor][key].disable());

    //getMoves
    gameState.board.squares.forEach(column => column.forEach(square => square.controlledBy[gameState.currentTurn] = []));
    Object.keys(thisSide).forEach(key => thisSide[key].getMoves());

    //see if in check
    var king = thisSide.king;
    if (gameState.board.squares[king.square.x][king.square.y].controlledBy[opponentColor].length === 1) {
        let attackingPiece = gameState.board.squares[king.square.x][king.square.y].controlledBy[opponentColor][0];

        //enable the king
        king.enable();

        //find block squares
        let attackDirection = attackingPiece.availableMoves.find(move => move.square.x === king.square.x && move.square.y === king.square.y).direction;
        var blockSquares = [];
        var iteratorSquare = king.square;
        while (iteratorSquare.x != attackingPiece.square.x || iteratorSquare.y != attackingPiece.square.y) {
            iteratorSquare = {x: iteratorSquare.x - attackDirection.x, y: iteratorSquare.y - attackDirection.y};
            blockSquares.push(iteratorSquare);
        }
        
        //enable pieces that can block and allow only block squares
        for (let piece in thisSide) {
            if (thisSide[piece].isKing()) {
                continue;
            }
            let blockMoves = [];
            for (let square in blockSquares) {
                for (let move in thisSide[piece].availableMoves) {
                    if (
                        thisSide[piece].availableMoves[move].square.x === blockSquares[square].x &&
                        thisSide[piece].availableMoves[move].square.y === blockSquares[square].y
                    ) {
                        blockMoves.push(thisSide[piece].availableMoves[move]);
                    }
                }
            }
            thisSide[piece].availableMoves = blockMoves;
            if (thisSide[piece].availableMoves.length > 0) {
                thisSide[piece].enable();
            }                
        }

        //add check display
        gameState.checkDisplay = new CheckDisplay({square: king.square, gameState: gameState});
    }
    else if (gameState.board.squares[king.square.x][king.square.y].controlledBy[opponentColor].length > 1 ) {
        //multiple checks mean enable only the king
        king.enable();

        //add check display
        gameState.checkDisplay = new CheckDisplay({square: king.square, gameState: gameState});
    }
    else {
        //enable all pieces
        Object.keys(gameState.pieces[gameState.currentTurn]).forEach(key => gameState.pieces[gameState.currentTurn][key].enable());
    }

    startTimer(gameState);
}

function endTurn(gameState) {
    stopTimer(gameState);
    
    if (gameState.promotion) {
        return;
    }

    //remove check square if necessary 
    if (gameState.checkDisplay) {
        gameState.checkDisplay.render.remove();
        gameState.checkDisplay = false;
    }

    //repopulate controlled squares
    Object.keys(gameState.pieces[gameState.currentTurn]).forEach(key => gameState.pieces[gameState.currentTurn][key].getMoves());

    //toggle currentTurn
    if (gameState.currentTurn === 'white') {
        gameState.currentTurn = 'black';
    } else if (gameState.currentTurn === 'black') {
        gameState.currentTurn = 'white';
    }
    
    newTurn(gameState);
}

function getAllPieces(gameState) {
    var allPieces = [];
    Object.keys(gameState.pieces.black).forEach( key => allPieces.push(gameState.pieces.black[key]));
    Object.keys(gameState.pieces.white).forEach( key => allPieces.push(gameState.pieces.white[key]));
    return allPieces;
}



//game set up functions
function createSide(params) {
    var pawns = {};
    for (let i = 0; i < 8; i++) {
        let id = `pawn${String.fromCharCode(97 + i)}`;
        pawns[id] = new Pawn({...params, square: {x: i, y: params.color==='white' ? 1 : 6}, id: id});
    }

    return {
        rooka: new Rook({...params, square: {x: 0, y: params.color==='white' ? 0 : 7}, id: 'rooka'}),
        knightb: new Knight({...params, square: {x: 1, y: params.color==='white' ? 0 : 7}, id: 'knightb'}),
        bishopc: new Bishop({...params, square: {x: 2, y: params.color==='white' ? 0 : 7}, id: 'bishopc'}),
        king: new King({...params, square: {x: 3, y: params.color==='white' ? 0 : 7}, id: 'king'}),
        queen: new Queen({...params, square: {x: 4, y: params.color==='white' ? 0 : 7},  id: 'queen'}),
        bishopf: new Bishop({...params, square: {x: 5, y: params.color==='white' ? 0 : 7}, id: 'bishopf'}),
        knightg: new Knight({...params, square: {x: 6, y: params.color==='white' ? 0 : 7}, id: 'knightg'}),
        rookh: new Rook({...params, square: {x: 7, y: params.color==='white' ? 0 : 7}, id: 'rookh'}),
        ...pawns
    };
}

function newGame() {
    gameState.board = new Board({squareSize: squareSize, boardSize: boardSize, render: document.getElementById("board")});
    gameState.pieces = {
        black: createSide({color: 'black', gameState: gameState}),
        white: createSide({color: 'white', gameState: gameState}),
    };
    newTurn(gameState);
}
