import React, { useContext, useReducer } from 'react';
import {
  MatrixContext,
  MatrixExpandedRowsContext,
  MatrixExpandedRowsDispatchContext,
  matrixExpandedRowsReducer,
} from './MatrixContext';
import { TableBody } from '@material-ui/core';
import { MatrixRow } from './MatrixRow';

export const MatrixBody = () => {
  const { rows } = useContext(MatrixContext);
  const [expandedRows, dispatch] = useReducer(matrixExpandedRowsReducer, []);
  return (
    <MatrixExpandedRowsContext.Provider value={expandedRows}>
      <MatrixExpandedRowsDispatchContext.Provider value={dispatch}>
        <TableBody>
          {rows.map(row => (
            <MatrixRow row={row} key={row.title} parents={[]} />
          ))}
        </TableBody>
      </MatrixExpandedRowsDispatchContext.Provider>
    </MatrixExpandedRowsContext.Provider>
  );
};
