/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { DialogContent } from '@material-ui/core';
import Markdown from 'markdown-to-jsx';
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
  const { description = '', showRawValue } = presentation;
  const closeModal = () => {
    dispatch({ type: ACTION_TYPES.SET_ENLARGED_CELL, payload: null });
  };

  const bodyText = `${description}${showRawValue ? ` ${value}` : ''}`.replace(/\\n/g, '\n\n');
  return (
    <Dialog open onClose={closeModal}>
      <DialogHeader title={rowTitle} onClose={closeModal} />
      <Content>
        <DisplayWrapper>{displayValue}</DisplayWrapper>
        <Markdown>{bodyText.replace(/\\n/g, '\n\n')}</Markdown>
      </Content>
      <DialogFooter>
        <Button onClick={closeModal} variant="outlined" color="default">
          Back to table
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
