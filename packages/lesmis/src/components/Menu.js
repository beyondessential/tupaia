/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import MuiButton from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import MuiList from '@material-ui/core/List';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import styled from 'styled-components';
import MuiListItem from '@material-ui/core/ListItem';

const StyledButton = styled(MuiButton)``;

const Paper = styled.div`
  background: white;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  margin-top: 0.3rem;
  min-width: 13rem;
`;

const StyledListItem = styled(MuiListItem)`
  font-size: 0.875rem;
  line-height: 1rem;
  padding: 0.5rem 1.25rem;
  color: ${props => props.theme.palette.text.secondary};

  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: none;
  }
`;

const options = ['English', 'Laotian'];

export const Menu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div style={{ position: 'relative' }}>
        <StyledButton onClick={handleClick}>{options[selectedIndex]}</StyledButton>
        <Popper keepMounted disablePortal anchorEl={anchorEl} open={open} placement="bottom-end">
          <Paper>
            <MuiList>
              {options.map((option, index) => (
                <StyledListItem
                  key={option}
                  button
                  selected={index === selectedIndex}
                  onClick={event => handleMenuItemClick(event, index)}
                >
                  {option}
                </StyledListItem>
              ))}
            </MuiList>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};
