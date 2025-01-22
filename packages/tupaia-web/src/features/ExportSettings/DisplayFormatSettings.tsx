import React from 'react';
import styled from 'styled-components';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { useExportSettings } from './ExportSettingsContext';
import { ExportSettingLabel } from './ExportSettingLabel';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
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

export const DisplayFormatSettings = () => {
  const { separatePagePerItem, updateSeparatePagePerItem } = useExportSettings();

  return (
    <Wrapper>
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
    </Wrapper>
  );
};
