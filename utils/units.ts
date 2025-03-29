export const UNIT_TO_METER_FACTOR = 0.02
export const EMPTY_COLOR = 125

export const meterToUnit = (meters) => {
    return meters / UNIT_TO_METER_FACTOR
}

export const GRID_CELL_SIZE = meterToUnit(0.1)

