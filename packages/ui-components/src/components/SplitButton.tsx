import React, { useState, useRef, ElementType } from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import MuiButtonGroup from '@material-ui/core/ButtonGroup';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { Button } from './Button';

const DefaultButton = styled(Button)`
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  &.MuiButtonBase-root {
    margin: 0;
  }
`;

const ButtonGroup = styled(MuiButtonGroup)`
  margin-right: 1rem;
`;

type Option = {
  id: string;
  label: string;
};

interface SplitButtonProps {
  options: Option[];
  selectedId?: string | null;
  setSelectedId: (id: string) => void;
  onClick?: (id: string | null) => void;
  ButtonComponent?: ElementType;
}

export const SplitButton = ({
  options,
  selectedId = null,
  setSelectedId,
  onClick = () => {},
  ButtonComponent = DefaultButton,
}: SplitButtonProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.id === selectedId);

  const handleClick = () => {
    onClick(selectedId);
  };

  const handleMenuItemClick = (id: string) => {
    setSelectedId(id);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document>) => {
    // if the user clicks away, but their click still lands on some part of the component, keep open
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Grid item xs={12}>
      <ButtonGroup ref={anchorRef}>
        <ButtonComponent onClick={handleClick} style={{ minWidth: '10rem' }}>
          {selectedOption && selectedOption.label}
        </ButtonComponent>
        <ButtonComponent style={{ minWidth: 'auto' }} onClick={handleToggle}>
          <KeyboardArrowDown />
        </ButtonComponent>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        disablePortal
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map(({ id, label }) => (
                    <MenuItem
                      key={id}
                      selected={id === selectedId}
                      onClick={() => handleMenuItemClick(id)}
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
  );
};
