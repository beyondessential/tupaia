/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useExportSettings } from './ExportSettingsContext';
import { ExportSettingLabel } from './ExportSettingLabel';
import { TextField, OutlinedTextFieldProps } from '@material-ui/core';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ExportDescriptionInputArea = styled((props: OutlinedTextFieldProps) => (
  <TextField {...props} />
))`
  & .MuiOutlinedInput-root {
    border-radius: 4px;
  }
  & .MuiFilledInput-underline:before {
    border-bottom: none;
  }
  & .MuiOutlinedInput-notchedOutline {
    border: 0.1rem solid ${({ theme }) => theme.palette.text.secondary};
  }
  & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline {
    border: 0.1rem solid ${({ theme }) => theme.palette.error.main};
  }
  & .MuiInputBase-root {
    padding: 0.5rem;
    background: none;
    color: ${({ theme }) => theme.palette.text.primary};
  }
  margin-block-start: 1rem;
`;

const ExportDescriptionFooter = styled.div<{
  charLimitReached: boolean;
}>`
  display: flex;
  align-self: end;
  justify-content: space-between;
  margin-top: 0.313rem;
  color: ${({ charLimitReached, theme }) =>
    charLimitReached ? theme.palette.error.main : theme.palette.text.primary};
`;

const ExportDescriptionInput = () => {
  const {
    exportDescription,
    updateExportDescription,
    exportDescriptionCharLimitReached,
    exportDescriptionCharLimit,
  } = useExportSettings();

  return (
    <Wrapper>
      <ExportSettingLabel as="legend">Description</ExportSettingLabel>
      <ExportDescriptionInputArea
        id="description"
        multiline
        rows={6}
        value={exportDescription}
        onChange={updateExportDescription}
        variant="outlined"
        error={exportDescriptionCharLimitReached}
        placeholder="Enter description here"
      />
      <ExportDescriptionFooter charLimitReached={exportDescriptionCharLimitReached}>
        {exportDescriptionCharLimitReached ? `Character limit reached:` : `Characters:`}{' '}
        {exportDescription?.length || 0}/{exportDescriptionCharLimit}
      </ExportDescriptionFooter>
    </Wrapper>
  );
};

export default ExportDescriptionInput;
