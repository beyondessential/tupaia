/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import styled from 'styled-components';
import { MatrixWrapper } from '../src/components/View/MatrixWrapper';

const Container = styled.div`
  margin: 1rem auto;
  width: 600px;
`;

export default {
  title: 'Chart/Matrix',
  component: MatrixWrapper,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const Template = args => <MatrixWrapper {...args} />;

export const SimpleMatrix = Template.bind({});
SimpleMatrix.args = {
  viewContent: {
    name: 'Simple Matrix',
    type: 'matrix',
    columns: [
      { key: 'Col1', title: 'Brown' },
      { key: 'Col2', title: 'Blue' },
    ],
    rows: [
      {
        dataElement: 'Cows',
        Col1: 1,
        Col2: 2,
      },
      {
        dataElement: 'Sheeps',
        Col1: 10,
        Col2: 55,
      },
    ],
  },
  isEnlarged: true,
};

export const DotMatrix = Template.bind({});
DotMatrix.args = {
  viewContent: {
    name: 'Dot Matrix',
    type: 'matrix',
    columns: [
      { key: 'Col1', title: 'Brown' },
      { key: 'Col2', title: 'Blue' },
    ],
    rows: [
      {
        dataElement: 'Cows',
        Col1: 0,
        Col2: 2,
      },
      {
        dataElement: 'Sheeps',
        Col1: 6,
        Col2: 55,
      },
    ],
    presentationOptions: {
      type: 'condition',
      showRawValue: true,
      conditions: [
        {
          key: 'red',
          color: '#b71c1c',
          legendLabel: '0',
          condition: 0,
          description: 'Months of stock: ',
        },
        {
          key: 'green',
          color: '#33691e',
          legendLabel: '3 - 6',
          condition: { '<': 7, '>=': 3 },
          description: 'Months of stock: ',
        },
        {
          key: 'orange',
          color: '#EE9A30',
          legendLabel: '< 3',
          condition: { '<': 3, '>': 0 },
          description: 'Months of stock: ',
        },
        {
          key: 'yellow',
          color: '#fdd835',
          legendLabel: '> 7',
          condition: { '>': 7 },
          description: 'Months of stock: ',
        },
      ],
    },
  },
  isEnlarged: true,
};
