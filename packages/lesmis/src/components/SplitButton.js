/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MuiButtonGroup from '@material-ui/core/ButtonGroup';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

const ButtonGroup = styled(MuiButtonGroup)`
  margin-right: 1rem;
`;

const WhiteButton = styled(Button)`
  background: white;
  padding: 0.7rem;
  min-width: 10rem;
  font-size: 1rem;
  min-height: 3.1rem;
  line-height: 1.2rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
  border: 1px solid ${props => props.theme.palette.grey['400']};

  &:hover {
    border: 1px solid ${props => props.theme.palette.grey['400']};
  }
`;

const DropdownButton = styled(WhiteButton)`
  min-width: auto;
`;

// eslint-disable-next-line react/prop-types
export const SplitButton = ({ options, selectedId, setSelectedId, onClick }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const selectedOption = options.find(o => o.id === selectedId);

  const handleClick = () => {
    onClick(selectedId);
  };

  const handleMenuItemClick = (event, id) => {
    setSelectedId(id);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item xs={12}>
        <ButtonGroup ref={anchorRef}>
          <WhiteButton onClick={handleClick}>{selectedOption.label}</WhiteButton>
          <DropdownButton color="primary" size="small" onClick={handleToggle}>
            <KeyboardArrowDown />
          </DropdownButton>
        </ButtonGroup>
        <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {options.map(({ id, label }) => (
                      <MenuItem
                        key={id}
                        selected={id === selectedId}
                        onClick={event => handleMenuItemClick(event, id)}
                      >
                        {label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Grid>
    </Grid>
  );
};
