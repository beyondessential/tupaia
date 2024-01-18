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
    margin-inline-end: 0.5rem;
  }
  label {
    padding: 0;
    margin-top: 0.625rem;
  }
`;

const Group = styled(FormGroup)`
  > div {
    margin-inline-start: 0.5rem;
    margin-block-start: 0;
  }
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
  );
};
