/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import styled from 'styled-components';
import MuiList from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import DropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { WHITE } from '../styles';

const List = styled(MuiList)`
  color: ${WHITE};
`;

export class DropDownMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
    this.handleOpenMenu = this.handleOpenMenu.bind(this);
    this.handleCloseMenu = this.handleCloseMenu.bind(this);
    this.handleChangeSelection = this.handleChangeSelection.bind(this);
  }

  handleOpenMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleCloseMenu() {
    this.setState({ anchorEl: null });
  }

  handleChangeSelection(newSelectedOption) {
    this.handleCloseMenu();
    this.props.onChange(newSelectedOption);
  }

  renderListComponent() {
    const { options, selectedOption, iconStyle } = this.props;

    return options.length > 1 ? (
      <List component="nav">
        <ListItem button onClick={this.handleOpenMenu}>
          <ListItemText primary={selectedOption} />
          <DropDownIcon style={iconStyle} />
        </ListItem>
      </List>
    ) : (
      <List component="nav">
        <ListItem>
          <ListItemText primary={selectedOption} />
        </ListItem>
      </List>
    );
  }

  renderMenuComponent() {
    const { options, selectedOption, menuListStyle } = this.props;
    const { anchorEl } = this.state;

    return options.length > 1 ? (
      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={this.handleCloseMenu}
        MenuListProps={{ style: menuListStyle }}
      >
        {options.map(option => (
          <MenuItem
            key={option}
            onClick={() => this.handleChangeSelection(option)}
            selected={option === selectedOption}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    ) : null;
  }

  render() {
    return (
      <div>
        {this.renderListComponent()}
        {this.renderMenuComponent()}
      </div>
    );
  }
}
