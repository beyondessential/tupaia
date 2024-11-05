/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { useExportSettings } from './ExportSettingsContext';
import { ExportSettingLabel } from './ExportSettingLabel';
import { TextField, OutlinedTextFieldProps } from '@material-ui/core';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@tupaia/ui-components';
import { post } from '../../api';
import { useDashboard } from '../Dashboard';
import { useParams } from 'react-router';
import { useEntity, useProject } from '../../api/queries';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ExportDescriptionInputArea = styled((props: OutlinedTextFieldProps) => (
  <TextField {...props} />
))`
  margin-block-start: 1rem;

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
  margin-top: 0.313rem;
  color: ${({ error, theme }) => (error ? theme.palette.error.main : theme.palette.text.secondary)};
  font-size: 0.75rem;
`;

const MAX_CHARACTERS = 250;

export const ExportDescriptionInput = ({ systemPrompt, selectedDashboardItems }) => {
  const { exportDescription, setExportDescription } = useExportSettings();
  const { projectCode, entityCode } = useParams();
  const { activeDashboard } = useDashboard();
  const { data: project } = useProject(projectCode);
  const { data: entity } = useEntity(projectCode, entityCode);

  const { mutate } = useMutation(
    ['openai'],
    systemPrompt => {
      const userPrompt = {
        title: activeDashboard?.name,
        project: project?.name,
        country: entity?.name,
        dashboardItems: activeDashboard?.items.filter(item =>
          selectedDashboardItems.includes(item.code),
        ),
      };
      return post('openai', { data: { userPrompt, systemPrompt } });
    },
    {
      onSuccess: data => {
        if (data.message.content) {
          setExportDescription(data.message.content);
        }
      },
    },
  );

  const showMaxCharsWarning = exportDescription.length >= MAX_CHARACTERS;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExportDescription(e.target.value);
  };

  const handleClick = async () => {
    mutate(systemPrompt);
  };
  return (
    <Wrapper>
      <ExportSettingLabel as="legend">Description</ExportSettingLabel>
      <ExportDescriptionInputArea
        id="description"
        multiline
        rows={6}
        value={exportDescription}
        onChange={handleChange}
        variant="outlined"
        error={showMaxCharsWarning}
        inputProps={{ maxLength: MAX_CHARACTERS }}
        placeholder="Enter description here"
      />
      <ExportDescription error={showMaxCharsWarning}>
        {showMaxCharsWarning && 'Character limit reached: '}
        {exportDescription.length}/{MAX_CHARACTERS}
      </ExportDescription>
      <Button onClick={handleClick}>★ AI Autocomplete</Button>
    </Wrapper>
  );
};
