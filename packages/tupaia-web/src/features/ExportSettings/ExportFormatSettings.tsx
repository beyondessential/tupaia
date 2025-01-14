import React from 'react';
import styled from 'styled-components';
import {
  FormControl,
  RadioGroup,
  FormControlLabel as BaseFormControlLabel,
  Radio,
} from '@material-ui/core';
import { ExportSettingLabel, useExportSettings } from '.';

const FormControlLabel = styled(BaseFormControlLabel)`
  margin-left: 0;
  margin-top: 0.625rem;
  .MuiButtonBase-root {
    padding: 0 0.8rem 0 0;
  }
`;

export const ExportFormatSettings = ({ exportFormatOptions }) => {
  const { exportFormat, updateExportFormat } = useExportSettings();
  return (
    <FormControl component="fieldset">
      <ExportSettingLabel as="legend">Export format</ExportSettingLabel>
      <RadioGroup name="exportFormat" value={exportFormat} onChange={updateExportFormat}>
        {exportFormatOptions.map(exportFormatOption => (
          <FormControlLabel
            value={exportFormatOption.value}
            control={<Radio color="primary" />}
            label={exportFormatOption.label}
            key={exportFormatOption.value}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
