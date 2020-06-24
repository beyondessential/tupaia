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
  padding: 0;
  min-width: 11rem;

  > span svg {
    transition: transform 0.3s ease;
  }

  &.active {
    .MuiButton-label {
      background-color: white;

      > span {
        color: ${props => props.theme.palette.text.primary};

        svg {
          color: ${props => props.theme.palette.text.secondary};
        }
      }
    }
  }

  .MuiButton-label {
    &:hover,
    &:focus {
      background-color: white;

      > span {
        color: ${props => props.theme.palette.text.primary};

        svg {
          color: ${props => props.theme.palette.text.secondary};
          transform: rotate(180deg);
        }
      }
    }
  }
`;

const ValueSpan = styled.span`
  padding-right: 2rem;
  padding-left: 1.2rem;
  line-height: 1rem;
`;

const IconSpan = styled.span`
  padding: 0.5rem 0.5rem 0.4rem;
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
  font-size: 0.875rem;
  line-height: 1rem;
  display: flex;
  align-items: center;
  color: ${props => props.theme.palette.text.secondary};
  padding-top: 0.875rem;
  padding-bottom: 0.875rem;

  &:hover {
    background-color: ${props => props.theme.palette.error.main};

    span,
    svg {
      font-weight: 500;
      color: white;
    }
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
    <ButtonGroup className={open ? 'active' : null} onClick={handleToggle}>
      <ValueSpan>State: {value}</ValueSpan>
      <IconSpan>
        <ExpandMoreIcon />
      </IconSpan>
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
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.any.isRequired,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};
