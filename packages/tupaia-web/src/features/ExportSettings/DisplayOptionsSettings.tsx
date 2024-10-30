/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { FormControl, FormGroup } from '@material-ui/core';
import { Checkbox as BaseCheckbox } from '@tupaia/ui-components';
import { ExportFormats, useExportSettings } from './ExportSettingsContext';
import { ExportSettingLabel } from './ExportSettingLabel';

const Checkbox = styled(BaseCheckbox)`
  margin: 0.5rem 0 0 1rem;
  .MuiButtonBase-root {
    padding: 0;
    margin-right: 0.5rem;
  }
  label {
    padding: 0;
    margin-top: 0.625rem;
  }
`;

const Group = styled(FormGroup)`
  > div {
    margin-left: 0.5rem;
    margin-top: 0;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DisplayOptionsSettings = () => {
  const {
    exportWithLabels,
    updateExportWithLabels,
    exportWithTable,
    updateExportWithTable,
    exportWithTableDisabled,
    exportFormat,
  } = useExportSettings();
  if (exportFormat !== ExportFormats.PNG) return null;

  return (
    <Wrapper>
      <FormControl component="fieldset">
        <ExportSettingLabel as="legend">Display options</ExportSettingLabel>
        <Group>
          <Checkbox
            label="Export with labels"
            value={true}
            name="displayOptions"
            color="primary"
            checked={exportWithLabels}
            onChange={updateExportWithLabels}
          />
          {!exportWithTableDisabled && (
            <Checkbox
              label="Export with table"
              value={true}
              name="displayOptions"
              color="primary"
              checked={exportWithTable}
              onChange={updateExportWithTable}
            />
          )}
        </Group>
      </FormControl>
    </Wrapper>
  );
};
