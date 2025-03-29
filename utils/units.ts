export const UNIT_TO_METER_FACTOR = 0.02
export const EMPTY_COLOR = 125

export const meterToUnit = (meters) => {
    return meters / UNIT_TO_METER_FACTOR
}

export const unitToMeter = (units) => {
    return units * UNIT_TO_METER_FACTOR
}

export const GRID_CELL_SIZE = meterToUnit(0.1)

export const angleToDirection = (angle) => {
    switch (angle % 360) {
        case 90:
            return "top"
        case 0:
            return "right"
        case 270:
            return "bottom"
        case 180:
            return "left"
    }
}