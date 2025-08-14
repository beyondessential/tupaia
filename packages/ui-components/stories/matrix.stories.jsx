import React from 'react';
import { Box } from '@material-ui/core';
import styled from 'styled-components';
import { Matrix } from '../src';
import {
  groupedRows,
  entityLinkRows,
  groupedColumns,
  basicColumns,
  basicRows,
  groupedRowsWithCategoryData,
  dotPresentationOptions,
  markdownPresentationOptions,
  rangeCategoryPresentationOptions,
  entityLinkColumns,
} from './fixtures/matrix';

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

export const RowEntityLinks = Template.bind({});
RowEntityLinks.args = {
  rows: entityLinkRows,
  columns: entityLinkColumns,
};

export const Dots = Template.bind({});
Dots.args = {
  rows: [
    {
      title: 'Data item 1',
      Col1: 0,
      Col2: '0',
      Col3: 6,
      Col4: 6.1,
    },
    {
      title: 'Data item 2',
      Col1: 6.76,
      Col2: 'isBlue',
      Col4: 74.2,
      Col3: 44.998,
    },
  ],
  presentationOptions: {
    type: 'condition',
    conditions: [
      {
        key: 'red',
        color: '#b71c1c',
        label: 'Secondary header',
        condition: 0,
      },
      {
        key: 'orange',
        color: '#EE9A30',
        label: '',
        condition: {
          '<=': 6,
          '>': 0,
        },
      },
      {
        key: 'green',
        color: '#33691e',
        label: '',
        condition: {
          '>': 6,
        },
      },
      {
        key: 'blue',
        color: '#3498db',
        label: '',
        condition: 'isBlue',
      },
    ],
  },
  columns: basicColumns,
};

export const GroupedRowsWithDots = Template.bind({});
GroupedRowsWithDots.args = {
  rows: groupedRows,
  presentationOptions: dotPresentationOptions,
  columns: basicColumns,
};

export const HiddenColumnTitles = Template.bind({});
HiddenColumnTitles.args = {
  rows: groupedRows,
  presentationOptions: dotPresentationOptions,
  hideColumnTitles: true,
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
