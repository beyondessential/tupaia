/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { DialogContent, Typography } from '@material-ui/core';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext } from './MatrixContext';
import styled from 'styled-components';
import { Dialog, DialogFooter, DialogHeader } from '../Dialog';
import { Button } from '../Button';

const Content = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DisplayWrapper = styled.div`
  margin-bottom: 1rem;
`;

/**
 * This is the modal that appears when a user clicks on a cell in the matrix
 */
export const EnlargedMatrixCell = () => {
  const { enlargedCell } = useContext(MatrixContext);
  const dispatch = useContext(MatrixDispatchContext)!;
  if (!enlargedCell) return null;
  const { rowTitle, value, displayValue, presentation = {} } = enlargedCell;
  const { description = '' } = presentation;
  const closeModal = () => {
    dispatch({ type: ACTION_TYPES.SET_ENLARGED_CELL, payload: null });
  };
  return (
    <Dialog open onClose={closeModal}>
      <DialogHeader title={rowTitle} onClose={closeModal} />
      <Content>
        <DisplayWrapper>{displayValue}</DisplayWrapper>
        <Typography>
          {description} {value}
        </Typography>
      </Content>
      <DialogFooter>
        <Button onClick={closeModal}>Back to table</Button>
      </DialogFooter>
    </Dialog>
  );
};
