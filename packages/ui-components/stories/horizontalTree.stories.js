/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { randomIntBetween, sleep } from '@tupaia/utils';
import React from 'react';
import styled from 'styled-components';
import { HorizontalTree } from '../src';
import { getEntityDescendants } from './story-utils/api';

export default {
  title: 'HorizontalTree',
};

const Container = styled.div`
  width: 1100px;
  height: 600px;
`;

const LOADING_TREE = [
  {
    id: 'loading_hierarchy',
    name: 'Click me to see loading state',
    children: [
      {
        id: 'loading_child',
        name: 'Should see loading state instead of this',
      },
    ],
  },
];

const ERROR_TREE = [
  {
    id: 'error_hierarchy',
    name: 'Australia',
    children: [
      {
        id: 'error_child',
        name: 'Should see error instead of this',
      },
    ],
  },
];

export const horizontalTree = () => (
  <Container>
    <HorizontalTree
      data={getEntityDescendants()}
      fetchData={async (rootNode, node) => {
        await sleep(randomIntBetween(200, 1200));
        return getEntityDescendants(rootNode?.code, node?.code);
      }}
    />
  </Container>
);

export const horizontalTreeRootError = () => (
  <Container>
    <HorizontalTree
      data={ERROR_TREE}
      fetchData={async () => {
        await sleep(500);
        throw new Error('Cannot get data for the selected entity');
      }}
    />
  </Container>
);

export const horizontalTreeRootLoading = () => (
  <Container>
    <HorizontalTree
      data={LOADING_TREE}
      fetchData={async () => {
        await sleep(100000);
        return [];
      }}
    />
  </Container>
);

export const horizontalTreeChildrenError = () => (
  <Container>
    <HorizontalTree
      data={ERROR_TREE}
      fetchData={async childNode => {
        if (childNode) {
          await sleep(1500);
          throw new Error('Cannot get data for the selected entity');
        } else {
          return ERROR_TREE;
        }
      }}
    />
  </Container>
);

export const horizontalTreeChildrenLoading = () => (
  <Container>
    <HorizontalTree
      fetchData={async childNode => {
        if (childNode) {
          await sleep(100000);
          return [];
        }
        return LOADING_TREE;
      }}
    />
  </Container>
);
