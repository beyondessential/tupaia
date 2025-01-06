/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import { CheckboxList } from '../../src/components/CheckboxList';

export default {
  title: 'Inputs/CheckboxList',
};

export const checkboxList = () => {
  const list = [0, 1, 2, 3, 3].map((v, index) => ({
    name: `List item ${v + 1}`,
    code: index,
    tooltip: index % 2 === 0 ? 'This is a tooltip' : '',
    disabled: index % 2 === 0,
  }));
  const [selectedItems, setSelectedItems] = React.useState([]);

  return (
    <CheckboxList list={list} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
  );
};
