/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { DataLibrary } from '../src/components/DataLibrary';

export default {
  title: 'Inputs/DataLibrary',
};

const OuterContainer = styled.div`
  max-width: 600px;
  padding: 2rem;
  background: #fff1db;
`;

const Container = styled.div`
  background: white;
`;

const options = [
  {
    id: '1',
    code: 'ABC_1',
    description:
      'Count the number of data in child entities within selected period, then sum and group by ancestor entities (aggregationEntityType)',
  },
  { id: '2', code: 'ABC_2', description: 'Sentinel Site Two' },
  { id: '3', code: 'ABC_3', description: 'Sentinel Site Three' },
  { id: '4', code: 'ABC_4', description: 'Sentinel Site Four' },
  { id: '5', code: 'ABC_5', description: 'Sentinel Site Five' },
  { id: '6', code: 'ABC_6', description: 'Sentinel Site Six' },
  { id: '7', code: 'ABC_7', description: 'Sentinel Site Seven' },
  { id: '8', code: 'ABC_8', description: 'Sentinel Site Eight' },
  { id: '9', code: 'ABC_9', description: 'Sentinel Site Nine' },
  {
    id: '10',
    code: 'ABC_10_LONG_CODE_HOW_NOW_BROWN_COW_HEY_HEY',
    description: 'Sentinel Site Ten',
  },
  {
    id: '11',
    code: 'ABC_11',
    description:
      'Sentinel Site Eleven long name how now brown cow and the quick brown fox as well jumped over the lazy dog',
  },
  {
    id: '12',
    code: 'ABC_12',
    description:
      'Sentinel Site Twelve long name how now brown cow and the quick brown fox as well jumped over the lazy dog',
  },
];

export const Simple = () => {
  const [value, setValue] = useState([options[1]]);
  const [inputValue, setInputValue] = useState('');
  return (
    <OuterContainer>
      <Container>
        <DataLibrary
          options={options}
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        />
      </Container>
    </OuterContainer>
  );
};

export const AllowAddMultipleTimes = () => {
  const [value, setValue] = useState([options[1]]);
  return (
    <OuterContainer>
      <Container>
        <DataLibrary
          options={options}
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          allowAddMultipleTimes
        />
      </Container>
    </OuterContainer>
  );
};

export const Tabs = () => {
  const [value, setValue] = useState([options[1]]);
  const [dataType, setDataType] = useState('Cats');

  const dogs = [
    { id: '1', code: 'DOG_1', name: 'Dog One' },
    { id: '2', code: 'DOG_2', name: 'Dog Two' },
    { id: '3', code: 'DOG_3', name: 'Dog Three' },
  ];

  return (
    <OuterContainer>
      <Container>
        <DataLibrary
          options={{ Cats: options, Dogs: dogs }}
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          dataTypes={['Cats', 'Dogs']}
          dataType={dataType}
          onChangeDataType={(event, newValue) => setDataType(newValue)}
        />
      </Container>
    </OuterContainer>
  );
};

export const Loading = () => {
  return (
    <OuterContainer>
      <Container>
        <DataLibrary options={options} isLoading />
      </Container>
    </OuterContainer>
  );
};

export const MaxNumResults = () => {
  return (
    <OuterContainer>
      <Container>
        <DataLibrary options={options} searchPageSize={12} />
      </Container>
    </OuterContainer>
  );
};
