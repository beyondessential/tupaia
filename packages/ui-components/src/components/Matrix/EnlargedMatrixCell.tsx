/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { DialogContent, Typography } from '@material-ui/core';
import Markdown from 'markdown-to-jsx';
import styled from 'styled-components';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext } from './MatrixContext';
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

const SecondaryHeader = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1.2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-bottom: 1rem;
`;
/**
 * This is the modal that appears when a user clicks on a cell in the matrix
 */
export const EnlargedMatrixCell = () => {
  const { enlargedCell, presentationOptions = {}, categoryPresentationOptions = {} } = useContext(
    MatrixContext,
  );
  const dispatch = useContext(MatrixDispatchContext)!;
  // If there is no enlarged cell set, don't render anything
  if (!enlargedCell) return null;
  const { rowTitle, value, displayValue, presentation = {}, isCategory } = enlargedCell;
  // If it is a category header cell, use the category presentation options, otherwise use the normal presentation options
  const presentationOptionsToUse = isCategory ? categoryPresentationOptions : presentationOptions;

  const { showRawValue } = presentationOptionsToUse;
  const { description = '', label } = presentation || {};
  const closeModal = () => {
    dispatch({ type: ACTION_TYPES.SET_ENLARGED_CELL, payload: null });
  };

  // Render the description, and also value if showRawValue is true. Also handle newlines in markdown
  const bodyText = `${description}${showRawValue ? ` ${value}` : ''}`.replace(/\\n/g, '\n\n');
  return (
    <Dialog open onClose={closeModal}>
      <DialogHeader title={rowTitle} onClose={closeModal} titleVariant="h2" />
      <Content>
        {label && <SecondaryHeader>{label}</SecondaryHeader>}
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
