/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Box } from '@material-ui/core';
import styled from 'styled-components';
import { Matrix } from '../src/components/Matrix/Matrix.tsx';

const Container = styled(Box)`
  background: ${({ theme }) => theme.palette.background.default};
  padding: 1rem;
  height: 38rem;
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export default {
  title: 'Matrix',
  decorators: [
    Story => (
      <Container>
        <h2>Matrix</h2>
        <Story />
      </Container>
    ),
  ],
  parameters: {
    theme: 'dark',
  },
};

const groupedRows = [
  {
    title: 'Data item 1',
    children: [
      {
        title: 'Sub item 1',
        Col4: 59.5,
        Col2: 43.4,
      },
      {
        title: 'Sub item 2',
        Col1: 6.76,
        Col4: 74.2,
        Col3: 44.998,
      },
      {
        title: 'Sub item 3',
        Col1: 33.9,
        Col4: 11.749,
        Col2: 6.347,
        Col3: 35.9,
      },
      {
        title: 'Sub item 4',
        Col1: 0.05,
        Col4: 32.11,
        Col2: 0,
        Col3: 7.1,
      },
      {
        title: 'Sub item 5',
        Col1: 320,
        Col4: 17,
        Col2: 69.325,
        Col3: 142.68,
      },
      {
        title: 'Sub item 6',
        Col1: 534,
        Col3: 0,
      },
    ],
  },
  {
    title: 'Data item 2',
    children: [
      {
        title: 'Sub item 7',
        Col1: 661,
        Col4: 0,
        Col2: 3.78,
        Col3: 0,
      },
      {
        title: 'Sub item 8',
        Col4: 24,
        Col3: 53.4,
      },
      {
        title: 'Sub item 9',
        Col4: 0,
        Col2: 7.92,
      },
      {
        title: 'Sub item 10',
        Col1: 46.22,
        Col4: 2.35,
        Col3: 1.62,
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
            Col1: 661.7,
            Col4: 0,
            Col2: 3.78,
            Col3: 0,
          },
          {
            title: 'Sub item 14',
            Col4: 24.34,
            Col3: 53.43,
          },
        ],
      },
      {
        title: 'Sub item 15',
        children: [
          {
            title: 'Sub item 16',
            Col4: 22.86,
            Col2: 19.24,
            Col3: 1.532,
          },
          {
            title: 'Sub item 17',
            Col4: 0,
            Col2: 7.92,
          },
        ],
      },
    ],
  },
];

const basicRows = [
  {
    title: 'Data item 1',
    Col4: 59.5,
    Col2: 43.4,
  },
  {
    title: 'Data item 2',
    Col1: 6.76,
    Col4: 74.2,
    Col3: 44.998,
  },
  {
    title: 'Data item 3',
    Col1: 33.9,
    Col4: 11.749,
    Col2: 6.347,
    Col3: 35.9,
  },
  {
    title: 'Data item 4',
    Col1: 0.05,
    Col4: 32.11,
    Col2: 0,
    Col3: 7.1,
  },
  {
    title: 'Data item 5',
    Col1: 320,
    Col4: 17,
    Col2: 69.325,
    Col3: 142.68,
  },
  {
    title: 'Data item 6',
    Col1: 534,
    Col3: 0,
    Col5: 10,
    Col6: 3,
  },
];

const basicColumns = [
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

const groupedColumns = [
  {
    title: 'Column group 1',
    children: [
      {
        key: 'Col1',
        title: 'Col1',
      },
      {
        key: 'Col2',
        title: 'Col2',
      },
      {
        key: 'Col3',
        title: 'Col3',
      },
    ],
  },
  {
    title: 'Column group 2',
    children: [
      {
        key: 'Col4',
        title: 'Col4',
      },
      {
        key: 'Col5',
        title: 'Col5',
      },
      {
        key: 'Col6',
        title: 'Col6',
      },
    ],
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

const markdownPresentationOptions = {
  conditions: [
    {
      key: '0',
      color: '#525258',
      label: '',
      description: 'A **Blank** cell means this.\n',
    },
    {
      key: '1',
      color: '#279A63',
      label: '',
      description: '**Green** signifies something else.\n',
    },
    {
      key: '2',
      color: '#EE9A30',
      label: '',
      description: '**Orange** signifies another thing.\n',
    },
    {
      key: '3',
      color: '#EE4230',
      label: '',
      description: '**Red** signifies this other thing.\n',
    },
  ],
};

const groupedRowsWithCategoryData = [
  {
    title: 'Data item 1',
    Col1: 10,
    Col2: 20,
    Col3: 30,
    Col4: 40,
    children: [
      {
        title: 'Sub item 1',
        Col4: 59.5,
        Col2: 43.4,
      },
      {
        title: 'Sub item 2',
        Col1: 6.76,
        Col4: 74.2,
        Col3: 44.998,
      },
      {
        title: 'Sub item 3',
        Col1: 33.9,
        Col4: 11.749,
        Col2: 6.347,
        Col3: 35.9,
      },
      {
        title: 'Sub item 4',
        Col1: 0.05,
        Col4: 32.11,
        Col2: 0,
        Col3: 7.1,
      },
      {
        title: 'Sub item 5',
        Col1: 320,
        Col4: 17,
        Col2: 69.325,
        Col3: 142.68,
      },
      {
        title: 'Sub item 6',
        Col1: 534,
        Col3: 0,
      },
    ],
  },
  {
    title: 'Data item 2',
    Col1: 1,
    Col2: 2,
    Col3: 4,
    Col4: 25,
    children: [
      {
        title: 'Sub item 7',
        Col1: 661,
        Col4: 0,
        Col2: 3.78,
        Col3: 0,
      },
      {
        title: 'Sub item 8',
        Col4: 24,
        Col3: 53.4,
      },
      {
        title: 'Sub item 9',
        Col4: 0,
        Col2: 7.92,
      },
      {
        title: 'Sub item 10',
        Col1: 46.22,
        Col4: 2.35,
        Col3: 1.62,
      },
      {
        title: 'Sub item 11',
      },
    ],
  },
  {
    title: 'Data item 3',
    Col1: 2,
    Col4: 40,
    children: [
      {
        title: 'Sub item 12',
        Col1: 10,
        Col4: 50,
        children: [
          {
            title: 'Sub item 13',
            Col1: 661.7,
            Col4: 0,
            Col2: 3.78,
            Col3: 0,
          },
          {
            title: 'Sub item 14',
            Col4: 24.34,
            Col3: 53.43,
          },
        ],
      },
      {
        title: 'Sub item 15',
        children: [
          {
            title: 'Sub item 16',
            Col4: 22.86,
            Col2: 19.24,
            Col3: 1.532,
          },
          {
            title: 'Sub item 17',
            Col4: 0,
            Col2: 7.92,
          },
        ],
      },
    ],
  },
];

const rangeCategoryPresentationOptions = {
  red: {
    max: 20,
    min: 0,
    color: '#b71c1c',
    label: '',
    description: 'Averaged score:',
  },
  type: 'range',
  green: {
    max: 100,
    min: 70,
    color: '#33691e',
    label: '',
    description: 'Averaged score:',
  },
  yellow: {
    max: 69,
    min: 21,
    color: '#fdd835',
    label: '',
    description: 'Averaged score:',
  },
  showRawValue: true,
};

const applyLocationPresentationOptions = {
  ...dotPresentationOptions,
  applyLocation: {
    columnIndexes: [3],
  },
};

const Template = args => <Matrix {...args} />;

export const Simple = Template.bind({});
Simple.args = {
  rows: basicRows,
  columns: basicColumns,
};

export const GroupedRowsWithDots = Template.bind({});
GroupedRowsWithDots.args = {
  rows: groupedRows,
  presentationOptions: dotPresentationOptions,
  columns: basicColumns,
};

export const GroupsRowsWithBasicData = Template.bind({});
GroupsRowsWithBasicData.args = {
  rows: groupedRows,
  columns: basicColumns,
};

export const GroupedColumns = Template.bind({});
GroupedColumns.args = {
  rows: basicRows,
  columns: groupedColumns,
};

export const GroupedColumnsAndRows = Template.bind({});
GroupedColumnsAndRows.args = {
  rows: groupedRows,
  columns: groupedColumns,
};

export const MarkdownPresentationDescription = Template.bind({});
MarkdownPresentationDescription.args = {
  rows: [
    {
      title: 'Data item 1',
      Col4: 2,
      Col2: 3,
    },
    {
      title: 'Data item 2',
      Col1: 3,
      Col4: 2,
      Col3: 4,
    },
    {
      title: 'Data item 3',
      Col1: 3,
      Col4: 1,
      Col2: 2,
      Col3: 2,
    },
  ],
  presentationOptions: markdownPresentationOptions,
  columns: basicColumns,
};

export const GroupsRowsWithCategoryPresentationOptions = Template.bind({});
GroupsRowsWithCategoryPresentationOptions.args = {
  rows: groupedRowsWithCategoryData,
  columns: basicColumns,
  categoryPresentationOptions: rangeCategoryPresentationOptions,
};

export const ApplyLocationPresentationOptions = Template.bind({});
ApplyLocationPresentationOptions.args = {
  rows: basicRows,
  presentationOptions: applyLocationPresentationOptions,
  columns: basicColumns,
};
