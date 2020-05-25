import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

export const ActionsMenu = ({ options }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handlers = {
    click: event => setAnchorEl(event.currentTarget),
    close: () => setAnchorEl(null),
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handlers.click}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        keepMounted
        disablePortal
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlers.close}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: -60,
        }}
        PaperProps={{ style: { width: '135px' } }}
      >
        {Object.entries(options).map(([label, action]) => (
          <MenuItem
            key={label}
            onClick={() => {
              action();
              return handlers.close();
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

ActionsMenu.propTypes = {
  options: PropTypes.object.isRequired,
};
