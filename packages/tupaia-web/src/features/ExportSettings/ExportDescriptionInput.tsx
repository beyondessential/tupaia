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
  margin-block-start: 0.6rem;

  .MuiInputBase-root {
    border: 1px solid ${({ theme }) => theme.palette.text.secondary};
    border-radius: 5px;
    padding: 0.6rem 0.75rem 0.75rem;
    background: none;
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 0.875rem;
    line-height: 1.4;

    &.Mui-error {
      border: 1px solid ${({ theme }) => theme.palette.error.main};
    }

    &.Mui-focused {
      border-color: ${({ theme }) => theme.palette.text.primary};
    }
  }
`;

const ExportDescription = styled.div<{
  error: boolean;
}>`
  display: flex;
  align-self: end;
  justify-content: space-between;
  margin-top: 0.3rem;
  color: ${({ error, theme }) => (error ? theme.palette.error.main : theme.palette.text.secondary)};
  font-size: 0.75rem;
`;

const MAX_CHARACTERS = 250;

export const ExportDescriptionInput = () => {
  const { exportDescription, updateExportDescription } = useExportSettings();
  const showMaxCharsWarning = exportDescription.length >= MAX_CHARACTERS;

  return (
    <Wrapper>
      <ExportSettingLabel as="legend">Description</ExportSettingLabel>
      <ExportDescriptionInputArea
        id="description"
        multiline
        rows={4}
        value={exportDescription}
        onChange={updateExportDescription}
        variant="outlined"
        error={showMaxCharsWarning}
        inputProps={{ maxLength: MAX_CHARACTERS }}
        placeholder="Enter description here"
      />
      <ExportDescription error={showMaxCharsWarning}>
        {showMaxCharsWarning && 'Character limit reached: '}
        {exportDescription.length}/{MAX_CHARACTERS}
      </ExportDescription>
    </Wrapper>
  );
};
