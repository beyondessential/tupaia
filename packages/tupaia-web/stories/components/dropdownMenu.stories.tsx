/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Meta } from '@storybook/react';
import { DropDownMenu } from '../../src/components/DropDownMenu';
import React, { useState } from 'react';

const meta: Meta<typeof DropDownMenu> = {
  title: 'components/DropDownMenu',
  component: DropDownMenu,
};

export default meta;

const options = ['Option 1', 'Option 2'];

export const Simple = () => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  return (
    <DropDownMenu
      options={options}
      selectedOptionIndex={selectedOptionIndex}
      onChange={setSelectedOptionIndex}
      disableGutters={true}
    />
  );
};

export const IconStyles = () => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  return (
    <DropDownMenu
      options={options}
      selectedOptionIndex={selectedOptionIndex}
      onChange={setSelectedOptionIndex}
      iconStyle={{
        color: 'orange',
      }}
    />
  );
};

export const MenuListStyles = () => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  return (
    <DropDownMenu
      options={options}
      selectedOptionIndex={selectedOptionIndex}
      onChange={setSelectedOptionIndex}
      menuListStyle={{
        backgroundColor: 'orange',
      }}
    />
  );
};

export const AnchorOrigin = () => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  return (
    <DropDownMenu
      options={options}
      selectedOptionIndex={selectedOptionIndex}
      onChange={setSelectedOptionIndex}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    />
  );
};

export const PrimaryComponent = () => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  return (
    <DropDownMenu
      options={options}
      selectedOptionIndex={selectedOptionIndex}
      onChange={setSelectedOptionIndex}
      StyledPrimaryComponent={({ children }) => (
        <span
          style={{
            color: 'orange',
          }}
        >
          {children}
        </span>
      )}
    />
  );
};

export const OptionComponent = () => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  return (
    <DropDownMenu
      options={options}
      selectedOptionIndex={selectedOptionIndex}
      onChange={setSelectedOptionIndex}
      StyledOptionComponent={({ children }) => (
        <span
          style={{
            color: 'orange',
          }}
        >
          {children}
        </span>
      )}
    />
  );
};
