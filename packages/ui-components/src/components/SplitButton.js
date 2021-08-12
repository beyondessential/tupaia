/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Button } from '@tupaia/ui-components';
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

export const SplitButton = ({ options, selectedId, setSelectedId, onClick, ButtonComponent }) => {
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
          <ButtonComponent onClick={handleClick} style={{ minWidth: '10rem' }}>
            {selectedOption.label}
          </ButtonComponent>
          <ButtonComponent style={{ minWidth: 'auto' }} onClick={handleToggle}>
            <KeyboardArrowDown />
          </ButtonComponent>
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

SplitButton.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  selectedId: PropTypes.string,
  setSelectedId: PropTypes.func,
  onClick: PropTypes.func,
  ButtonComponent: PropTypes.any.isRequired,
};

SplitButton.defaultProps = {
  selectedId: null,
  setSelectedId: null,
  onClick: () => {},
};
