import { functions, parseParams } from '../../functions';

export const select = (rows, params) => {
  return rows.map(row => {
    const { as, ...selectionFunctions } = parseParams(row, params);
    const selectionFunction = Object.keys(selectionFunctions)[0]; // We only support 1 selection function for now
    const selectionResult = functions[selectionFunction](selectionFunctions[selectionFunction]);
    const rowWithSelection = { ...row };
    if (selectionResult !== undefined || selectionResult !== null) {
      rowWithSelection[as] = selectionResult;
    }
    return rowWithSelection;
  });
};
