import { createContext } from "react"

var board = {
    x: 0,
    y: 0,
    pressedAlready = false,
    board = []
};

export const boardcontext = createContext(board);