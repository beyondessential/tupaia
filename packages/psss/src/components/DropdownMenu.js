/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MuiPaper from '@material-ui/core/Paper';
import MuiMenuItem from '@material-ui/core/MenuItem';
import MuiMenuList from '@material-ui/core/MenuList';
import { LightOutlinedButton } from '@tupaia/ui-components';

const ButtonGroup = styled(LightOutlinedButton)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.8rem 0 1.2rem;
  min-width: 13rem;

  &:hover {
    background-color: white;
    span,
    svg {
      color: ${props => props.theme.palette.primary.main};
    }
  }

  ${({ isActive }) =>
    isActive &&
    `
    background: white;
    
    &.MuiButtonBase-root {
      span {
        color: #414d55;
      }
    
      svg {
        color: #9AA8B0;
      }
    } 
  `}
`;

const LeftSpan = styled.span`
  padding-right: 2rem;
  line-height: 1rem;
`;

const RightSpan = styled.span`
  padding-left: 0.8rem;
  padding-top: 0.7rem;
  padding-bottom: 0.6rem;
  border-left: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Paper = styled(MuiPaper)`
  position: absolute;
  top: calc(100% - 1px);
  left: -1px;
  width: calc(2px + 100%);
  box-shadow: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`;

const MenuList = styled(MuiMenuList)`
  padding: 0;
`;

const MenuItem = styled(MuiMenuItem)`
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  font-size: 14px;
  line-height: 16px;
  display: flex;
  align-items: center;
  color: #6f7b82;
  padding-top: 14px;
  padding-bottom: 14px;

  &:hover {
    background-color: initial;
  }

  &.MuiButtonBase-root.Mui-selected {
    background-color: ${props => props.theme.palette.error.main};
    color: white;
    font-weight: 500;
  }
`;

export const DropdownMenu = ({ options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(options[0].value);

  const handleMenuItemClick = (event, option) => {
    event.preventDefault();
    event.stopPropagation();
    setValue(option.value);
    onChange(option);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const remainingOptions = options.filter(option => option.value !== value);

  return (
    <ButtonGroup isActive={open} onClick={handleToggle}>
      <LeftSpan>State: {value}</LeftSpan>
      <RightSpan>
        <ExpandMoreIcon />
      </RightSpan>
      {open && (
        <Paper>
          <ClickAwayListener onClickAway={handleClose}>
            <MenuList>
              {remainingOptions.map(option => (
                <MenuItem
                  key={option.value}
                  selected={option.value === value}
                  onClick={event => handleMenuItemClick(event, option)}
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      )}
    </ButtonGroup>
  );
};

DropdownMenu.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};
