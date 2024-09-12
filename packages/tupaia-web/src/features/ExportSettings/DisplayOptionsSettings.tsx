/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { FormControl, FormControlLabel, FormGroup, Radio, RadioGroup } from '@material-ui/core';
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

const Container = styled.div`
  padding-block-end: 2rem;
  & + & {
    padding-block-start: 1.5rem;
    border-top: 0.1rem solid ${({ theme }) => theme.palette.text.secondary};
  }
  &:last-child {
    padding-block-end: 0;
  }
`;

const RadioItem = styled(FormControlLabel)`
  padding-block-end: 0.625rem;
  &:first-child {
    padding-block-start: 0.625rem;
  }
  .MuiButtonBase-root {
    padding-block: 0;
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
    separatePagePerItem,
    updateSeparatePagePerItem,
  } = useExportSettings();
  if (exportFormat !== ExportFormats.PNG) return null;

  return (
    <Wrapper>
      <Container>
        <FormControl component="fieldset">
          <ExportSettingLabel as="legend">Format</ExportSettingLabel>
          <RadioGroup
            name="separatePagePerItem"
            value={separatePagePerItem}
            onChange={updateSeparatePagePerItem}
          >
            <RadioItem value={true} control={<Radio color="primary" />} label="One per page" />
            <RadioItem value={false} control={<Radio color="primary" />} label="Print continuous" />
          </RadioGroup>
        </FormControl>
      </Container>
      <Container>
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
      </Container>
    </Wrapper>
  );
};
