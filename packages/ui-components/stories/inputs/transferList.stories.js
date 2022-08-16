/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import { TransferList } from '../../src/components/TransferList';

export default {
  title: 'Inputs/TransferList',
};

const leftDefaultItems = [0, 1, 2, 3];
const rightDefaultItems = [4, 5, 6, 7];

export const transferList = () => {
  const [left, setLeft] = React.useState(leftDefaultItems.map(v => `List item ${v + 1}`));
  const [right, setRight] = React.useState(rightDefaultItems.map(v => `List item ${v + 1}`));

  return <TransferList left={left} setLeft={setLeft} right={right} setRight={setRight} />;
};
