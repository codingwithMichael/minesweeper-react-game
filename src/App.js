
import { useContext, useEffect, useRef, useState } from 'react';
import './App.css';
import { boardcontext } from './boardcontext';
import { pressedContext } from './pressedContext';
import { isNewGameContext } from './isNewGameContext';
import { isGameOverContext } from "./isGameOverContext";
import UICell from './UIcell';

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
  // create flagged spots for where the user clicked
  let flagged = new Map([
      [String(pressedx) + " " + String(pressedy), true],
      [String(pressedx + 1) + " " + String(pressedy), true],
      [String(pressedx - 1) + " " + String(pressedy), true],
      [String(pressedx) + " " + String(pressedy + 1), true],
      [String(pressedx) + " " + String(pressedy - 1), true]
  ]) 
  let count = 0;
  while(count < numBombs) {
      if (count == ((board[0].length * board.length) - 5)) {
          break
      }
      for(let y in board) {
          if (count == numBombs) {
              break
          }
          if (count == ((board[0].length * board.length) - 5)) {
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
function App() {
  const height = 15;
  const width = 25;
  const bombs = 77;
  const board = createBoard(height, width);
  const [gameStatus, setGameStatus] = useState(true);
  const uncoverMap = createBoard(height,width);
  const [gameMade, setGame] = useState(false);
  const [didLose, updateLose] = useState(false);
  const [gridValues, updateGrid] = useState({x: 0, y: 0, board: board, uncoverMap: uncoverMap, bombsLeft: bombs});
  return (
    
    <div className="App">
       <isGameOverContext.Provider value= {{didLose, updateLose}}>
          <isNewGameContext.Provider value ={{gameStatus, setGameStatus}}>
          <pressedContext.Provider value = {{gameMade, setGame}}>
              <boardcontext.Provider value = {{gridValues, updateGrid}}>
              <TopBar bombs = {bombs}/>
              <Grid width={width} height={height} bombs={bombs} size={10}/>
            </boardcontext.Provider>
          </pressedContext.Provider>
          </isNewGameContext.Provider>
        </isGameOverContext.Provider>
    </div>
  );
}
function Row(props) { 
  const {gridValues, updateGrid} = useContext(boardcontext);
  let numbers = props.row

  const row = numbers.map((number, index) => 
    <UICell size={props.size} number = {number} x = {index} y = {props.height} bombs = {props.bombs} shouldBePressed = {gridValues.uncoverMap[props.height][index]}/>
  
  );
  return (
    <div class="row">
      {row}
    </div>
  )
  
}
function uncoverRemainingBombs(newGridMap, board) {
  for (let i in board) {
    for (let j in board[i]) {
        if (board[i][j] == 9 && newGridMap[i][j] != 2) {
            newGridMap[i][j] = 2;
        }
    }
}
}
function Grid(props) {
  
  const {gridValues, updateGrid} = useContext(boardcontext);
  
  const height = props.height
  const width = props.width;
  const bombs = props.bombs;
  const size = props.size;
  const col = gridValues.board.map((row, index) => <Row width = {width} size = {size} row={row} height = {index} bombs = {props.bombs}/>);
  
  return (
    <div className="grid">      
      {col}
    </div>
  )
}

function TopBar(props) {
  const {gridValues, updateGrid} = useContext(boardcontext);
  const [message, setMessage] = useState("");
  const [bombsLeft, updateBombs] = useState(props.bombs)
  const {gameMade, setGame} = useContext(pressedContext);
  const {gameStatus, setGameStatus} = useContext(isNewGameContext)
  const {didLose, updateLose} = useContext(isGameOverContext);
  var numberOfFlags = 0;
  useEffect(() => {
    let grid = gridValues.uncoverMap;
    let realGrid = gridValues.board;
    let isGameBeat = true
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        
        if (grid[i][j] == 2) {
          numberOfFlags += 1;
        }
        if (grid[i][j] == 0 && realGrid[i][j] != 9) {
          isGameBeat = false;
        }
      }
    }
    if (isGameBeat) {
      updateLose(true);
      setMessage("You won!");

      let bombsNeedToBePlace = false
      for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
          if (grid[i][j] == 0) {
            bombsNeedToBePlace = true
          }
        }
      }
      if (bombsNeedToBePlace) {
        let newGridMap = gridValues.uncoverMap;
        let board = gridValues.board
        uncoverRemainingBombs(newGridMap, board)

        const newGridValues = { board: gridValues.board, uncoverMap: newGridMap, bombsLeft: gridValues.bombsLeft};
        updateGrid(newGridValues);
      }
    }
    
    updateBombs(props.bombs - numberOfFlags);


}, [gridValues]);
useEffect(() => {
  if (didLose && message != "You won!") {
    setMessage("You lost");
  }
},[didLose])
  return (
    <div className="TopBar">
      <button className="newGamebtn" onClick={() => {
        const height = 15;
        const width = 25;
        const bombs = 77;
        const board = createBoard(height, width);
        const uncoverMap = createBoard(height,width);
        updateLose(false);
        let tempboard = {x: 0, y: 0, board: board ,uncoverMap: uncoverMap,bombsLeft: bombs };
        updateGrid(tempboard);
        setGame(false);
        setMessage("");
        if (gameStatus) {
          setGameStatus(false);
        } else {
          setGameStatus(true);
        }
    }}>New Game</button>
    <p>{message}</p>
    <p>bombs left: {bombsLeft}</p>
    </div>
  )
}




export default App;
