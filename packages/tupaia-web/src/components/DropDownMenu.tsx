/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ElementType, SyntheticEvent, useState } from 'react';
import styled from 'styled-components';
import {
  List as MuiList,
  ListItem,
  ListItemText,
  MenuItem,
  Menu,
  Typography,
  PopoverOrigin,
} from '@material-ui/core';
import DropDownIcon from '@material-ui/icons/ArrowDropDown';
import { ComponentType } from 'react';
import { ListProps } from 'material-ui';

const List = styled(MuiList)<
  ListProps & {
    as?: ComponentType | ElementType;
  }
>`
  color: ${({ theme }) => theme.palette.text.primary};
`;

interface ListComponentProps {
  title?: string;
  selectedOptionIndex: number;
  options: string[];
  iconStyle: object;
  PrimaryComponent: ComponentType;
  disableGutters: boolean;
  handleOpenMenu: (event: SyntheticEvent) => void;
}

const ListComponent = ({
  title,
  selectedOptionIndex,
  options,
  iconStyle,
  PrimaryComponent,
  disableGutters,
  handleOpenMenu,
}: ListComponentProps) => {
  return (
    <List as="nav">
      <ListItem disableGutters={disableGutters} onClick={handleOpenMenu} button>
        <ListItemText
          primary={<PrimaryComponent>{title || options[selectedOptionIndex]}</PrimaryComponent>}
        />
        {options.length > 1 && <DropDownIcon style={iconStyle} />}
      </ListItem>
    </List>
  );
};

interface MenuComponentProps {
  options: string[];
  anchorEl: SyntheticEvent['currentTarget'] | null;
  anchorOrigin?: PopoverOrigin;
  menuListStyle: object;
  selectedOptionIndex: number;
  handleCloseMenu: () => void;
  handleChangeSelection: (index: number) => void;
  OptionComponent: ComponentType;
}

const MenuComponent = ({
  options = [],
  anchorEl,
  anchorOrigin,
  menuListStyle,
  selectedOptionIndex,
  handleCloseMenu,
  handleChangeSelection,
  OptionComponent,
}: MenuComponentProps) => {
  return options.length > 1 ? (
    <Menu
      open={!!anchorEl}
      anchorEl={anchorEl}
      getContentAnchorEl={null}
      anchorOrigin={anchorOrigin}
      onClose={handleCloseMenu}
      MenuListProps={{ style: menuListStyle }}
    >
      {options.map((option, index) => (
        <MenuItem
          key={option}
          onClick={() => handleChangeSelection(index)}
          selected={index === selectedOptionIndex}
        >
          <OptionComponent>{option}</OptionComponent>
        </MenuItem>
      ))}
    </Menu>
  ) : null;
};

interface DropDownMenuProps {
  title?: string;
  options?: string[];
  selectedOptionIndex: number;
  iconStyle?: object;
  disableGutters?: boolean;
  onChange: (index: number) => void;
  menuListStyle?: object;
  anchorOrigin?: PopoverOrigin;
  StyledPrimaryComponent?: ComponentType;
  StyledOptionComponent?: ComponentType;
}

export const DropDownMenu = ({
  title = '',
  options = [],
  selectedOptionIndex,
  iconStyle = {},
  disableGutters = false,
  onChange,
  menuListStyle = {},
  anchorOrigin,
  StyledPrimaryComponent = Typography,
  StyledOptionComponent = Typography,
}: DropDownMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<SyntheticEvent['currentTarget'] | null>(null);

  const handleOpenMenu = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChangeSelection = (index: number) => {
    onChange(index);
    setAnchorEl(null);
  };
  return (
    <div>
      <ListComponent
        PrimaryComponent={StyledPrimaryComponent}
        title={title}
        selectedOptionIndex={selectedOptionIndex}
        options={options}
        iconStyle={iconStyle}
        disableGutters={disableGutters}
        handleOpenMenu={handleOpenMenu}
      />
      <MenuComponent
        options={options}
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        menuListStyle={menuListStyle}
        selectedOptionIndex={selectedOptionIndex}
        handleCloseMenu={() => setAnchorEl(null)}
        handleChangeSelection={handleChangeSelection}
        OptionComponent={StyledOptionComponent}
      />
    </div>
  );
};
