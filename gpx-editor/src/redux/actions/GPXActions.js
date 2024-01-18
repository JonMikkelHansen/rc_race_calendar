export const SET_TOLERANCE = 'SET_TOLERANCE';

export const setTolerance = (tolerance) => ({
  type: SET_TOLERANCE,
  payload: tolerance,
});

// Keep existing actions for minY and maxY
export const SET_MINY = 'SET_MINY';
export const SET_MAXY = 'SET_MAXY';

export const setMinY = (minY) => ({
  type: SET_MINY,
  payload: minY,
});

export const setMaxY = (maxY) => ({
  type: SET_MAXY,
  payload: maxY,
});
