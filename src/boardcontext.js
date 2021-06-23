import { createContext } from "react"

var board = {
    x: 0,
    y: 0,
    board: [],
    uncoverMap: [],
    bombsLeft: 0
};

export const boardcontext = createContext(board);