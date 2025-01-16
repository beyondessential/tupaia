import React from 'react';
import styled from 'styled-components';
import { MultiSelect } from '../../src/components';

export default {
  title: 'Inputs/MultiSelect',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

const options = [
  { label: 'All Countries', value: 'All' },
  { label: 'Afghanistan', value: 'AF' },
  { label: 'Albania', value: 'AL' },
  { label: 'American Samoa', value: 'AS' },
  { label: 'Angola', value: 'AO' },
  { label: 'New Caledonia', value: 'NC' },
  { label: 'New Zealand', value: 'NZ' },
  { label: 'Nicaragua', value: 'NI' },
  { label: 'Nigeria', value: 'NG' },
];

const getLabelForValue = value => options.find(option => option.value === value).label;

export const multiSelect = () => {
  return (
    <Container>
      <MultiSelect
        label="Select Countries"
        defaultValue={['All']}
        id="multi"
        options={options}
        renderValue={values =>
          values.length > 1 ? `${values.length} Countries Selected` : getLabelForValue(values[0])
        }
      />
    </Container>
  );
};

export const multiSelectWithTooltip = () => {
  return (
    <Container>
      <MultiSelect
        label="Select Countries"
        tooltip="You can select multiple countries"
        defaultValue={['All']}
        id="multi"
        options={options}
        renderValue={values =>
          values.length > 1 ? `${values.length} Countries Selected` : getLabelForValue(values[0])
        }
      />
    </Container>
  );
};
