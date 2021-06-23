import { useEffect, useRef, useState, useContext } from "react";
import { boardcontext } from './boardcontext';
import { pressedContext } from "./pressedContext";
import { isNewGameContext } from "./isNewGameContext";
import { isGameOverContext } from "./isGameOverContext";


function createBoard(height, width) {
    let board = [];
    let row = []
    for(var i = 0; i < width; i++) {
        row.push(0);
    }
    for(var i = 0; i < height; i++) {
        board.push(clone(row));
    }
    return board
  }
  function clone(arr) {
    let copy = arr.map((x) => x);
    return copy
  }
  function populateBoard(board, numBombs, pressedx,pressedy) {
    let flagged = new Map([
        [String(pressedx) + " " + String(pressedy), true],
        [String(pressedx + 1) + " " + String(pressedy), true],
        [String(pressedx - 1) + " " + String(pressedy), true],
        [String(pressedx) + " " + String(pressedy + 1), true],
        [String(pressedx) + " " + String(pressedy - 1), true],
        [String(pressedx - 1) + " " + String(pressedy - 1), true],
        [String(pressedx + 1) + " " + String(pressedy - 1), true],
        [String(pressedx - 1) + " " + String(pressedy + 1), true],
        [String(pressedx + 1) + " " + String(pressedy + 1), true]
    ]) 
    let count = 0;
    while(count < numBombs) {
        if (count == ((board[0].length * board.length) - 9)) {
            break
        }
        for(let y in board) {
            if (count == numBombs) {
                break
            }
            if (count == ((board[0].length * board.length) - 9)) {
                break
            }
            for(let x in board[y]) {
                if (count == numBombs) {
                    break
                }
                if (flagged.has(String(x) + ' ' + String(y))) {
                    continue;
                }
                if (board[y][x] == 9) {
                    continue
                }
                var number = Math.random()
                if (number < 0.05) {
                    count += 1
                    board[y][x] = 9;
                    // add one to all spots around
                    const directionalMatrix = [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,0],[-1,1],[-1,-1]]
                    for(let j in directionalMatrix) {
                        let xpostion = parseInt(parseInt(x) + parseInt(directionalMatrix[j][0]));
                        let ypostion = parseInt(parseInt(y) + parseInt(directionalMatrix[j][1]));
                        
                        if (xpostion < 0 || ypostion < 0){
                            continue
                        }
                        if (xpostion > board[0].length - 1 || ypostion > board.length - 1) {
                            continue
                        }
                        if (board[ypostion][xpostion] == 9) {
                            continue
                        }
                        board[ypostion][xpostion] += 1
                    }
                }
            }
        }
    }
    return board
  
  }
  function FillIn(pboard, x, y) {
    let board = clone(pboard);
    var toBeChange = new Set();
    if (board[y][x] != 0) {
        return toBeChange;
    }
    var q = [[x,y]];
    var visited = new Set();
    var toBeChange = new Set();
    while (q.length > 0) {
        let current = q.shift()
        let x = current[0];
        let y = current[1];
        let directionalMatrix = [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,0],[-1,1],[-1,-1]];
        for (const i in directionalMatrix) {
            const newX = x + directionalMatrix[i][0];
            const newY = y + directionalMatrix[i][1];
            if (newX < 0 || newY < 0){
                continue
            }
            if (newX > board[0].length - 1 || newY > board.length - 1) {
                continue
            }
            if (visited.has(String(newX) + " " + String(newY))) {
                continue
            } else {
                visited.add(String(newX) + " " + String(newY))
            }
            toBeChange.add([newX,newY]);
            if (board[newY][newX] == 0) {
                q.push([newX,newY]);
            }

        }
    }
    return toBeChange
}
const UICell = (props) => {
    const {gameMade, setGame} = useContext(pressedContext);
    const {gridValues, updateGrid} = useContext(boardcontext);
    const {gameStatus, setGameStatus} = useContext(isNewGameContext)
    const {didLose, updateLose} = useContext(isGameOverContext);
    let newGridMap = gridValues.uncoverMap;
    const x = props.x;
    const y = props.y;
    
    //let currentTitle = "emptyCell";
    let shouldBePressed = props.shouldBePressed;
    //const [type, press] = useState("emptyCell");
    const hover = useRef(false);
    var number = props.number 
    
    function handler(e) {
        if (e.code === "Space") {
            handleSpaceBar();
        }
    }
    useEffect(() => {
        window.removeEventListener('keydown', handler);
        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler); 
        }
    }, [gameStatus, didLose]);
  
    if (number == 0) {
        number = " ";
    } else if (number == 9) {
        number = "B";
    }
    return (  
        <div className={getClassName(covertIDtoName(shouldBePressed))} onClick={() => {
            if (!didLose) {
                uncovertile();
            }
            
        }} onMouseEnter={() => {
            hover.current = true;
        }} onMouseLeave={() => {
            hover.current = false;
        }}
        key ={String(x) + " " + String(y)} >
            {number}
        </div>
    )
    function handleSpaceBar() { 
        if (didLose) {
            return;
        }
        if (hover.current == true) {            
            console.log("start grid");
            console.log(gridValues)
            console.log("end grid");
            if (newGridMap[y][x] == 1) {
                //press("pressed");
                newGridMap[y][x] = 1;
                const newGridValues = { board: gridValues.board, uncoverMap: newGridMap, bombsLeft: gridValues.bombsLeft};
                updateGrid(newGridValues);
                return
            }
            if (newGridMap[y][x] == 0) {
                console.log(2);
                newGridMap[y][x] = 2;
                const newGridValues = { board: gridValues.board, uncoverMap: newGridMap, bombsLeft: gridValues.bombsLeft};
                updateGrid(newGridValues);
                //press("flagged");
                return
            }
            if (newGridMap[y][x] == 2) {
                console.log(3)
                newGridMap[y][x] = 0;
                const newGridValues = { board: gridValues.board, uncoverMap: newGridMap, bombsLeft: gridValues.bombsLeft};
                updateGrid(newGridValues);
                //press("emptyCell");
                return
            }
        }   
    }
    function covertIDtoName(number) {
        if (number == 0) {
            return "emptyCell"
        } else if (number == 1) {
            return "pressed"
        } else if (number == 2) {
            return "flagged"
        } else if (number == 3) {
            return "lossUncover"
        }
    }
    function getClassName(type) {
        let cell = "cell";
        if (type == "pressed") {
            cell = "active";
        } else if (type == "flagged") {
            cell = "flagged"
        } else if (type == "emptyCell") {
            cell = "cell"
        } else if (type == "lossUncover") {
            return "lossUncover"
        }
        //console.log("yao is ming", cell, type)
        return cell;
    }
    function uncoverMines(board, uncoverMap) {
        for (let i in board) {
            for (let j in board[i]) {
                if (board[i][j] == 9 && uncoverMap[i][j] != 2) {
                    uncoverMap[i][j] = 3;
                }
            }
        }
    }
    function uncovertile() {
        
        let board = gridValues.board;
        var newGridMap = gridValues.uncoverMap;
        
        if (!gameMade) { 
            board = populateBoard(board, props.bombs, x, y);
            //const newGridValues = { board: board, pressedAlready: true , uncoverMap: gridValues.uncoverMap, bombsLeft: gridValues.bombsLeft};
            //updateGrid(newGridValues);
        }
        console.log("beg")
        console.log(gridValues.uncoverMap);
        console.log("end")
        if (gridValues.uncoverMap[y][x] == 0 && number == 0 ) {
            console.log("this is happening")
            let toBeChange = FillIn(board, x, y);
            if (toBeChange.size == 0) {
                return;
            }
            
            for (let item of toBeChange) {
                let x = item[0];
                let y = item[1];
                newGridMap[y][x] = 1;
            }
            // const newGridValues = { board: gridValues.board, pressedAlready: true , uncoverMap: newGridMap, bombsLeft: gridValues.bombsLeft};
            // updateGrid(newGridValues);
        } 
        const newGridValues = { board: gridValues.board, uncoverMap: newGridMap, bombsLeft: gridValues.bombsLeft};
        updateGrid(newGridValues);
        setGame(true); 
        //pass the thing as the other thing 
        if (covertIDtoName(shouldBePressed) === "emptyCell") {
            console.log("this happens for me,", x, y)
            //press("pressed");
            let newGridMap = gridValues.uncoverMap;
            let board = gridValues.board
            newGridMap[y][x] = 1;

            console.log("this happens as well")
            if (number == "B") {
                //Document.locotion.reload(true);
                uncoverMines(board, newGridMap);
                updateLose(true);
                console.log("you loser");
            }
            
            const newGridValues = { board: gridValues.board, uncoverMap: newGridMap, bombsLeft: gridValues.bombsLeft};
            updateGrid(newGridValues);
        }
        
    }
}

export default UICell