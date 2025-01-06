/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { randomIntBetween, sleep } from '@tupaia/utils';
import React from 'react';
import styled from 'styled-components';
import { HorizontalTree } from '../src/components';
import { getEntityDescendants, getHierarchies } from './story-utils/api';

export default {
  title: 'HorizontalTree',
};

const Container = styled.div`
  width: 1100px;
  height: 600px;
`;

const fetchRoot = async () => {
  await sleep(randomIntBetween(200, 1200));
  return getHierarchies();
};

const fetchBranch = async (rootNode, node) => {
  await sleep(randomIntBetween(200, 1200));
  return getEntityDescendants(rootNode.code, node.code);
};

const fetchError = async () => {
  await sleep(500);
  throw new Error('Cannot get data for the selected entity');
};

const fetchLoading = async () => {
  await sleep(100000);
  return [];
};

export const horizontalTree = () => (
  <Container>
    <HorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchBranch} />
  </Container>
);

export const horizontalTreeReadOnly = () => (
  <Container>
    <HorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchBranch} readOnly />
  </Container>
);

export const horizontalTreeRootError = () => (
  <Container>
    <HorizontalTree fetchRoot={fetchError} fetchBranch={fetchBranch} />
  </Container>
);

export const horizontalTreeRootLoading = () => (
  <Container>
    <HorizontalTree fetchRoot={fetchLoading} fetchBranch={fetchBranch} />
  </Container>
);

export const horizontalTreeChildrenError = () => (
  <Container>
    <HorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchError} />
  </Container>
);

export const horizontalTreeChildrenLoading = () => (
  <Container>
    <HorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchLoading} />
  </Container>
);
