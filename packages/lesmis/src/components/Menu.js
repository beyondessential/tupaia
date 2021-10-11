/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';
import MuiMenu from '@material-ui/core/Menu';
import MuiMenuItem from '@material-ui/core/MenuItem';
import LanguageIcon from '@material-ui/icons/Language';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { LaosFlagSmall } from './Icons/LaosFlagSmall';
import { EnglishFlagSmall } from './Icons/EnglishFlagSmall';

const StyledButton = styled(MuiButton)`
  font-size: 12px;
  font-weight: 400;
  line-height: 140%;

  .MuiButton-startIcon {
    color: ${props => props.theme.palette.text.secondary};
    margin-right: 3px;
  }

  .MuiButton-endIcon {
    margin-left: 2px;

    .MuiSvgIcon-root {
      font-size: 15px;
    }
  }
`;

const StyledMenu = styled(MuiMenu)`
  .MuiList-root {
    padding: 8px 5px;
  }

  .MuiMenu-paper {
    overflow: visible;
    border: 1px solid ${props => props.theme.palette.grey['400']};

    &:before {
      position: absolute;
      top: -8px;
      right: 36px;
      z-index: -1;
      content: '';
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
      border-bottom: 7px solid ${props => props.theme.palette.grey['400']};
    }

    &:after {
      position: absolute;
      top: -7px;
      right: 36px;
      content: '';
      z-index: 12;
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
      border-bottom: 7px solid white;
    }
  }
`;

const MenuItem = styled(MuiMenuItem)`
  font-size: 12px;
  line-height: 140%;
  width: 150px;
  border-radius: 5px;

  svg {
    width: 30px;
    margin-right: 6px;
  }
`;

const options = [
  { key: 'en', label: 'English', Icon: EnglishFlagSmall },
  { key: 'la', label: 'Laotian', Icon: LaosFlagSmall },
];

export const Menu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedKey, setSelectedKey] = React.useState(options[0].key);

  const handleMenuItemClick = (event, key) => {
    setSelectedKey(key);
    setAnchorEl(null);
  };

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedOption = options.find(o => o.key === selectedKey);

  return (
    <>
      <StyledButton
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<ArrowDropDownIcon />}
      >
        <span>{selectedOption.label}</span>
      </StyledButton>
      <StyledMenu
        id="simple-menu"
        anchorEl={anchorEl}
        // This is needed to make the position work
        getContentAnchorEl={null}
        keepMounted
        elevation={0}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        variant="menu"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {options.map(({ key, label, Icon }) => (
          <MenuItem
            key={key}
            selected={key === selectedKey}
            onClick={event => handleMenuItemClick(event, key)}
          >
            <Icon />
            {label}
          </MenuItem>
        ))}
      </StyledMenu>
    </>
  );
};
