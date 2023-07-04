/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Matrix } from '../src/components/Matrix/Matrix.tsx';
import { Box } from '@material-ui/core';
import styled from 'styled-components';

const Container = styled(Box)`
  background: ${({ theme }) => theme.palette.background.default};
`;
export default {
  title: 'Matrix',
};

const nestedRows = [
  {
    title: 'Data item 1',
    children: [
      {
        title: 'Sub item 1',
        Col4: 59.32075471698,
        Col2: 43.54081468363,
      },
      {
        title: 'Sub item 2',
        Col1: 66.6071008699741,
        Col4: 74.25454545455,
        Col3: 44.99863076221,
      },
      {
        title: 'Sub item 3',
        Col1: 33.9575045207981,
        Col4: 11.74904942966,
        Col2: 6.340206185567,
        Col3: 35.97642436149,
      },
      {
        title: 'Sub item 4',
        Col1: 0.0550911756384881,
        Col4: 32.11627906977,
        Col2: 0,
        Col3: 7.122375991292,
      },
      {
        title: 'Sub item 5',
        Col1: 320.368110914891,
        Col4: 17.08296943231,
        Col2: 69.32551319648,
        Col3: 142.686774942,
      },
      {
        title: 'Sub item 6',
        Col1: 534.72335025378,
        Col3: 0,
      },
    ],
  },
  {
    title: 'Data item 2',
    children: [
      {
        title: 'Sub item 7',
        Col1: 661.724529503852,
        Col4: 0,
        Col2: 3.78441031585,
        Col3: 0,
      },
      {
        title: 'Sub item 8',
        Col4: 24.34458672875,
        Col3: 53.43045112782,
      },
      {
        title: 'Sub item 9',
        Col4: 0,
        Col2: 7.928045789043,
      },
      {
        title: 'Sub item 10',
        Col1: 46.2214562688536,
        Col4: 2.355140186916,
        Col3: 1.621621621622,
      },
      {
        title: 'Sub item 11',
      },
    ],
  },
  {
    title: 'Data item 3',
    children: [
      {
        title: 'Sub item 12',
        children: [
          {
            title: 'Sub item 13',
            Col1: 661.724529503852,
            Col4: 0,
            Col2: 3.78441031585,
            Col3: 0,
          },
          {
            title: 'Sub item 14',
            Col4: 24.34458672875,
            Col3: 53.43045112782,
          },
        ],
      },
      {
        title: 'Sub item 15',
        children: [
          {
            title: 'Sub item 16',
            Col4: 22.86995515695,
            Col2: 19.24965517241,
            Col3: 1.532066508314,
          },
          {
            title: 'Sub item 17',
            Col4: 0,
            Col2: 7.928045789043,
          },
        ],
      },
    ],
  },
];

const columns = [
  {
    key: 'Col1',
    title: 'Demo country 1',
  },
  {
    key: 'Col2',
    title: 'Demo country 2',
  },
  {
    key: 'Col3',
    title: 'Demo country 3',
  },
  {
    key: 'Col4',
    title: 'Demo country 4',
  },
];

const dotPresentationOptions = {
  type: 'condition',
  conditions: [
    {
      key: 'red',
      color: '#b71c1c',
      label: '',
      condition: 0,
      description: 'Months of stock: ',
      legendLabel: 'Stock out (MOS 0)',
    },
    {
      key: 'orange',
      color: '#EE9A30',
      label: '',
      condition: {
        '<': 6,
        '>': 0,
      },
      description: 'Months of stock: ',
      legendLabel: 'Below minimum (MOS 1-5)',
    },
    {
      key: 'green',
      color: '#33691e',
      label: '',
      condition: {
        '<': 18,
        '>=': 6,
      },
      description: 'Months of stock: ',
      legendLabel: 'Stocked appropriately (MOS 6-17)',
    },
    {
      key: 'yellow',
      color: '#fdd835',
      label: '',
      condition: {
        '>=': 18,
      },
      description: 'Months of stock: ',
      legendLabel: 'Overstock (MOS 18+)',
    },
  ],
  showRawValue: true,
};

const Template = args => (
  <Container>
    <Matrix {...args} columns={columns} />
  </Container>
);

export const NestedWithDots = Template.bind({});
NestedWithDots.args = {
  rows: nestedRows,
  columns,
  presentationOptions: dotPresentationOptions,
};
NestedWithDots.parameters = {
  theme: 'dark',
};
