/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SplitButton, Button } from '../src';

export default {
  title: 'SplitButton',
  component: SplitButton,
};

const options = [
  { id: 'xlsx', label: 'Export to XLSX' },
  { id: 'png', label: 'Export to PNG' },
];

const Template = args => {
  const [selectedId, setSelectedId] = React.useState(options[0].id);

  const handleClick = () => {
    console.info(`You clicked ${options[selectedId]}`);
  };

  return (
    <SplitButton
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      onClick={handleClick}
      {...args}
    />
  );
};

export const primary = Template.bind({});
primary.args = {
  options,
  ButtonComponent: Button,
};
