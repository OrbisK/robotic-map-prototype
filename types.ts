export interface GridCell {
    x: number,
    y: number,
    empty: boolean,
    wall: number
    room: number
}

export interface BufferItem {
    idx: number,
    dir: number,
    dist: number,
    type: 0 | 1 | 2 | 3 | 4
}

export type MeasureInstruction = {
    type: 'measure',
    payload: {
        distance: number
        angle: number
    }
}

export type TurnInstruction = {
    type: 'turn',
    payload: {
        angle: number
    }
}

export type MoveInstruction = {
    type: 'move',
    payload: {
        distance: number
    }
}

export type Instruction = MeasureInstruction | TurnInstruction | MoveInstruction
