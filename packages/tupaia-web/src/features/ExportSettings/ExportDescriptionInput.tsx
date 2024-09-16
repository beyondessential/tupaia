/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';
import { useExportSettings } from './ExportSettingsContext';
import { ExportSettingLabel } from './ExportSettingLabel';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ExportDescriptionInputArea = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 4px;
  }
  & .MuiOutlinedInput-notchedOutline {
    border: 0.1rem solid ${({ theme }) => theme.palette.text.secondary};
  }
  & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline {
    border: 0.1rem solid #f76853;
  }
  & .MuiInputBase-root {
    padding: 0.5em;
    background: none;
    color: white;
  }
  margin-block-start: 1em;
`;

const ExportDescriptionFooter = styled.div<{
  charLimitReached: boolean;
}>`
  display: flex;
  align-self: end;
  justify-content: space-between;
  margin-top: 5px;
  color: ${({ charLimitReached }) => (charLimitReached ? '#f76853' : '#ffffff')};
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
